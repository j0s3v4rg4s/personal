import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Camera} from 'ionic-native';
import {Back} from '../../providers/back/back';
import { AlertController } from 'ionic-angular';
import {HomePage} from '../home/home';

/*
  Generated class for the PerfilPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var firebase: any;

@Component({
  templateUrl: 'build/pages/perfil/perfil.html',
  providers: [Back]
})
export class PerfilPage {
  fecha: string
  genere: string
  altura: string
  peso: string
  base64Image: any
  urlfoto: any
  load = false
  constructor(private navCtrl: NavController, private back: Back, public alertCtrl: AlertController) {
    window.setTimeout(() => {
      let x = document.getElementsByClassName("datetime-text");
      x[0].innerHTML = "Birth date"

      let x2 = document.getElementsByClassName("select-text");
      x2[0].innerHTML = "Genere"
    }, 300)
    var user = firebase.auth().currentUser;
    this.urlfoto = user.photoURL
  }


  foto() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      correctOrientation: true
    }).then((imageData) => {
      this.base64Image = "data:image/jpeg;base64," + imageData
      this.urlfoto = this.base64Image
    }, (err) => {
      console.log(err);
    });
  }

  run() {
    var user = firebase.auth().currentUser;
    this.load = true;
    if (this.base64Image) {
      this.back.subirFoto(this.base64Image, user.uid, 'perfil.jpg').then(
        reul => {
          user.updateProfile({
            photoURL: reul
          }).then(
            () => {
              if (!this.fecha) {
                let date = new Date().getFullYear() - 34
                this.fecha = date + '-01-01'
              }
              if (!this.genere)
                this.genere = 'f'
              if (!this.altura)
                this.altura = '1.70'
              if (!this.peso)
                this.peso = "70"

              firebase.database().ref('user/' + user.uid + '/info').set({
                url: reul,
                genere: this.genere,
                altura: this.altura,
                peso: this.peso,
                fecha: this.fecha
              })
              this.load = false
              this.navCtrl.setRoot(HomePage)
            }
            )
        },
        err => {
          this.load = false
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'Error update photo',
            buttons: ['OK']
          });
          alert.present();
        }
      )
    }
    else {
      if (!this.fecha) {
        let date = new Date().getFullYear() - 34
        this.fecha = date + '-01-01'
      }
      if (!this.genere)
        this.genere = 'f'
      if (!this.altura)
        this.altura = '1.70'
      if (!this.peso)
        this.peso = "70"
      firebase.database().ref('user/' + user.uid + '/info').set({
        url: (user.photoURL) ? user.photoURL : "",
        genere: this.genere,
        altura: this.altura,
        peso: this.peso,
        fecha: this.fecha
      })
      this.load = false
      this.navCtrl.setRoot(HomePage)
    }
  }
}
