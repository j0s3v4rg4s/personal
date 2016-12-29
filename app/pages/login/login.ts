import { Component, OnInit} from '@angular/core';
import { NavController } from 'ionic-angular';
import {RegistrarPage} from '../registrar/registrar';
import {PerfilPage} from '../perfil/perfil';
import {HomePage} from '../home/home';
import {Facebook} from 'ionic-native';
import { AlertController } from 'ionic-angular';
/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var firebase: any;
var remove;
@Component({
  templateUrl: 'build/pages/login/login.html',
})
export class LoginPage implements OnInit {
  pageRegistrar: any
  load = false
  user: string
  pass: string
  constructor(private navCtrl: NavController, public alertCtrl: AlertController) {
    this.pageRegistrar = RegistrarPage;
  }

  ngOnInit() {
    remove = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.load = false
        remove()
        firebase.database().ref('user/' + user.uid).update({
          name: user.displayName,
          urlPhoto: user.photoURL,
          email: user.email
        })
        firebase.database().ref('user/' + user.uid + "/info").once('value', (snap) => {
          if (snap.val()) {
            this.navCtrl.setRoot(HomePage)
          }
          else {
            this.navCtrl.setRoot(PerfilPage)
          }
        })
      }
    });
  }

  fb() {
    this.load = true
    Facebook.login(['email']).then((_response) => {
      var creds = firebase.auth.FacebookAuthProvider.credential(_response.authResponse.accessToken)
      firebase.auth().signInWithCredential(creds)
    }).then((authData) => {

    }).catch((error) => {
      this.load = false
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: error,
        buttons: ['OK']
      });
      alert.present();
    });
  }

  sign() {
    if (!this.user || !this.pass) {
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Please fill all fields',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      firebase.auth().signInWithEmailAndPassword(this.user, this.pass).then(
        () => {
          remove()
          this.load = false
          this.navCtrl.setRoot(HomePage)
        },
        error => {
          this.load = false;
          let errorCode = error.code;
          let errorMessage = error.message;
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: errorMessage,
            buttons: ['OK']
          });
          alert.present();
        }
      )
    }
  }



}
