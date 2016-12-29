import { Component, OnInit} from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {Facebook} from 'ionic-native';
import {PerfilPage} from '../perfil/perfil';
import {HomePage} from '../home/home';

/*
  Generated class for the RegistrarPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var firebase: any;
var remove;

@Component({
  templateUrl: 'build/pages/registrar/registrar.html',
})
export class RegistrarPage implements OnInit {
  user: string;
  password: string;
  name: string;
  load = false;

  constructor(private navCtrl: NavController, public alertCtrl: AlertController) {

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

  registrar() {
    if (!this.user || !this.password || !this.name) {
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Please fill all fields ',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      this.load = true;
      firebase.auth().createUserWithEmailAndPassword(this.user, this.password).then(
        (user) => {
          remove()
          user.updateProfile({
            displayName: this.name
          }).then(
            () => {
              firebase.database().ref('user/' + user.uid).set({
                name: user.displayName,
                urlPhoto: user.photoURL,
                email: user.email
              })
              this.load = false
              this.navCtrl.setRoot(PerfilPage)
            }
            )
        },
        (error) => {
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

  facebookSignup() {
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

}
