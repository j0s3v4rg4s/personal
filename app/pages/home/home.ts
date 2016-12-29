import { Component, OnInit} from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { AlertController } from 'ionic-angular';
import {Back} from '../../providers/back/back';
import {Algoritmo} from '../../providers/algoritmo/algoritmo';


/*
  Generated class for the HomePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var google: any

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [Back, Algoritmo]
})
export class HomePage implements OnInit {
  map: any
  load = true
  myUbicacion: any
  myMarker: any
  infoPlaceSelected: any
  arrayMarker = []
  stateRun = false
  titulo: String
  estado: number
  kilometro: number
  cityCircle: any
  menu = false
  listaPuntos = []
  listaMiniPuntos = []
  numPunto: number
  markerSelect: any
  directionsDisplay: any
  constructor(private navCtrl: NavController, public alertCtrl: AlertController, private back: Back, private algoritmo: Algoritmo) {
    this.cityCircle = new google.maps.Circle()
    this.inicializador()
  }

  inicializador() {
    this.titulo = "1. Choose your distance"
    this.estado = 0
    this.kilometro = 0
    this.cityCircle.setMap(null)
    if (this.markerSelect) {
      this.markerSelect.setIcon('img/PinPuntos.svg')
      this.markerSelect.setZIndex(0)
    }

  }

  ngOnInit() {
    this.darPosicion()
    window.setTimeout(() => {
      this.loadMap()
      this.directionsDisplay = new google.maps.DirectionsRenderer;
      this.directionsDisplay.setMap(this.map);
    }, 100)

  }

  loadMap() {
    let optionMap = {
      center: new google.maps.LatLng(4.710988599999999, -74.072092),
      disableDefaultUI: true,
      rotateControl: true,
      zoom: 16
    }
    this.map = new google.maps.Map(document.getElementById('map'), optionMap);
    this.back.cargarPuntos().then(
      valor => {
        for (let key in valor) {
          let place = valor[key];
          let direction = new google.maps.LatLng(place.localitation.lat, place.localitation.lng);
          let marker = new google.maps.Marker({
            position: direction,
            map: this.map,
            animation: true,
            zIndex: 0,
            icon: "img/PinPuntos.svg"
          });
          marker.addListener('click', () => {
            console.log('click')
            this.infoPlaceSelected = {
              imgUrl: place.imgurl,
              descripcion: place.description,
              name: place.name
            }
          });
          this.arrayMarker[place.localitation.place_id] = marker;
        }
        this.load = false
      }
    )

  }

  darPosicion() {
    let optionGeoposition = {
      enableHighAccuracy: true,
      timeout: 5000
    }
    Geolocation.getCurrentPosition().then(
      (resp) => {
        let lat = resp.coords.latitude;
        let lng = resp.coords.longitude;
        this.myUbicacion = new google.maps.LatLng(lat, lng);
        this.map.setCenter(this.myUbicacion);
        this.myMarker = new google.maps.Marker({
          position: this.myUbicacion,
          map: this.map,
          icon: 'img/PinUsuario2.svg',
          title: 'I',
          zIndex: 99
        });
      },
      err => {
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: 'Position not found',
          buttons: ['OK']
        });
        alert.present();
      })
  }

  radio() {
    let distancia = ((this.kilometro) * 1000) / 2
    let option = {
      map: this.map,
      center: this.myUbicacion,
      radius: distancia,
      strokeColor: '#42a5f5',
    }
    this.cityCircle.setOptions(option)
    if (distancia > 0) {
      this.map.fitBounds(this.cityCircle.getBounds())
    }
  }

  estadoAlgoritmo() {
    switch (this.estado) {
      case 0:
        this.titulo = "1. Choose your distance"
        if (this.markerSelect) {
          this.markerSelect.setIcon('img/PinPuntos.svg')
          this.markerSelect.setZIndex(0)
        }
        break
      case 1:
        this.titulo = "2. Select principal Sight"
        if (this.markerSelect) {
          this.markerSelect.setIcon('img/PinPuntos.svg')
          this.markerSelect.setZIndex(0)
        }
        this.estado2()
        break
      case 2:
        this.titulo = "3. Select your route"
        this.estado3()
    }
  }

  estado2() {
    this.numPunto = 0
    this.listaPuntos = []
    this.listaMiniPuntos = []
    this.load = true
    this.directionsDisplay.setMap(null)
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': this.myUbicacion }, (result, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        this.back.darPuntosRadio(result, this.kilometro, this.map, this.myUbicacion).then(result => {
          this.load = false
          this.listaPuntos = result['puntos']
          this.listaMiniPuntos = result['miniPuntos']
          this.markerSelect = this.arrayMarker[this.listaPuntos[this.numPunto].localitation.place_id]
          this.markerSelect.setIcon('img/verde2.svg')
          this.markerSelect.setZIndex(99)
        })
      }
    })
  }

  renderPin() {
    this.markerSelect.setIcon('img/PinPuntos.svg')
    this.markerSelect.setZIndex(0)
    this.markerSelect = this.arrayMarker[this.listaPuntos[this.numPunto].localitation.place_id]
    this.markerSelect.setIcon('img/verde2.svg')
    this.markerSelect.setZIndex(99)
  }

  estado3() {
    let palce = this.listaPuntos[this.numPunto]
    this.listaPuntos.splice(this.numPunto, 1)
    this.listaPuntos.splice(0, 0, palce)
    let lista = this.listaPuntos.concat(this.listaMiniPuntos)
    console.log(lista)
    this.algoritmo.darRutas(lista, this.myUbicacion, this.kilometro).then(
      result => {
        this.directionsDisplay.setMap(this.map)
        this.directionsDisplay.setDirections(result);
        console.log(this.directionsDisplay.getRouteIndex())
      }
    )
  }

}
