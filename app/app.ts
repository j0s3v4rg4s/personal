import { Component, ViewChild, OnChanges} from '@angular/core';
import { ionicBootstrap, Platform, Nav } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import {LoginPage} from './pages/login/login';
import {PerfilPage} from './pages/perfil/perfil';
import {HomePage} from './pages/home/home';
import {DetalleService} from './providers/detalle-service/detalle-service';

declare var firebase: any;

@Component({
  templateUrl: 'build/app.html'
})
class MyApp implements OnChanges {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  load = true
  menu = true
  pages: Array<{ title: string, component: any }>;

  constructor(public platform: Platform) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'New Run', component: HomePage },
      { title: 'Logout', component: null }
    ];

  }

  ngOnChanges(dato) {
    console.log(dato)
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (!firebase) {
        let a = setTimeout(() => {
          if (firebase) {
            clearInterval(a)
            this.cargo()
          }
          else
            this.nocargo()
        }, 300)
      }
      else
        this.cargo()
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    if (!page.component) {
      firebase.auth().signOut()
      this.rootPage = LoginPage
    }
    else {
      this.nav.setRoot(page.component);
      console.log(page)
    }

  }

  cargo() {
    window.setTimeout(() => {
      this.load = false
      var user = firebase.auth().currentUser;
      if (user) {
        this.rootPage = HomePage
        this.menu = true
      }
      else
        this.rootPage = LoginPage
      console.log('cargo')
    }, 1000)
  }

  nocargo() {
    console.log('no cargo')
  }
}

ionicBootstrap(MyApp, [DetalleService]);
