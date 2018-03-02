/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

var vm = new Vue({
  el: '#orders',
  data: {
    orders: {},
    taxis: {}
  },
  created: function () {
    socket.on('initialize', function (data) {
      this.orders = data.orders;
    }.bind(this));

    socket.on('taxiAdded', function (taxi) {
      this.$set(this.taxis, taxi.taxiId, taxi);
      this.taxiMarkers[taxi.taxiId] = this.putTaxiMarker(taxi);
    }.bind(this));

    socket.on('taxiMoved', function (taxi) {
      //TODO! MIKAELS SKELETTKOD SOM EJ FUNKAR MED VÅR ATM :)
      /*this.taxis[taxi.taxiId].latLong = taxi.latLong;
      this.taxiMarkers[taxi.taxiId].setLatLng(taxi.latLong); */
    }.bind(this));

    socket.on('taxiQuit', function (taxiId) {
      Vue.delete(this.taxis, taxiId);
    }.bind(this));

    socket.on('taxiOrdered', function (order) {
      this.$set(this.orders, order.orderId, order);
    }.bind(this));

    socket.on('orderAccepted', function (order) {
      this.$set(this.orders, order.orderId, order);
    }.bind(this));

    socket.on('orderFinished', function (orderId) {
      Vue.delete(this.orders, orderId);
    }.bind(this));
  },
  methods: {
    assignTaxi: function (order) {
      socket.emit("taxiAssigned", order);
    },
  }
});
/*MAP stuff ---------------------------------*/

var directionsDisplay;
var directionsService;

var map, places;
var myplace = {lat: 59.840809, lng: 17.648666};
var myplacemarker;
var dest;
var destmarker;
var placeSearch, autocomplete;
var geocoder;
var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        postal_town: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
};

/*------------------------------------------*/
function initMap() {
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {

        zoom: 14,
        center: myplace,
        disableDefaultUI: true
    });

    myplacemarker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: myplace,
        icon: '/img/markers/red_MarkerA.png'
    });

    //myplacemarker.addListener('click', toggleBounce);


}
/*----------------------------------------------------*/





function show(toShow) {
    var y = document.getElementById(toShow);
    if (y.style.display == "block") {
      y.style.display = "none";
    }
    else {
      y.style.display = "block";
    }
}
