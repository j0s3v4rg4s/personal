import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Algoritmo provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

var distanciaUsuario = 0;
var distanciaAcumulada = 0;
var intermedios = [];
var anterior;
var disAnterior;
var directionsService;


declare var google: any;

@Injectable()
export class Algoritmo {

  constructor(private http: Http) { }


  darRutas(lista, ubicacion, distancia) {
    distanciaAcumulada = 0
    intermedios = []
    return new Promise((result, err) => {
      directionsService = new google.maps.DirectionsService()
      distanciaUsuario = distancia
      this.doSynchronousLoop(lista, ubicacion, loop1, this.f1, (res) => {
        result(res)
        console.log(res)
        // console.log(anterior)
        console.log(distanciaAcumulada)
        console.log(disAnterior)
      })
    })


  }

  doSynchronousLoop(data, info, loop, processData, done) {
    if (data.length > 0) {
      loop(data, 0, info, processData, done);
    } else {
      done(null);
    }
  }




  f1(data, i, info, cb) {
    intermedios.push({
      location: new google.maps.LatLng(data[i].localitation['lat'], data[i].localitation['lng']),
      stopover: true
    });
    //listaRecuperada = data

    var request = {
      origin: info,
      destination: info,
      travelMode: google.maps.TravelMode.WALKING,
      waypoints: intermedios,
      optimizeWaypoints: true
    }
    directionsService.route(request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        var dis = 0;
        for (let i = 0; i < response.routes[0].legs.length; i++) {
          dis += parseFloat(response.routes[0].legs[i].distance.value);
        }

        distanciaAcumulada = dis / 1000;

        if (distanciaUsuario > distanciaAcumulada) {
          anterior = response;
          disAnterior = distanciaAcumulada

        }
        cb(response);
      } else {
        console.error(status);
        cb(response);
      }
    });

  }

}

var loop1 = function(data, i, info, processData, cb) {
  processData(data, i, info, function(response) {
    if (distanciaUsuario > distanciaAcumulada) {
      if (++i < data.length) {
        loop1(data, i, info, processData, cb)
      }
      else {
        cb(response);
      }
    }
    else {
      cb(response);
    }
  });
}
