'use strict';
var socket = io();

var vm = new Vue({
  el: '#secondModalView',
  data: {
    orderId: null,
    map: null,
    fromMarker: null,
    destMarker: null,
    taxiMarkers: {}
  },
  created: function () {
    socket.on('initialize', function (data) {
      // add taxi markers in the map for all taxis

    }.bind(this));

    socket.on('orderId', function (orderId) {
      this.orderId = orderId;
      console.log(this.orderId)
    }.bind(this));

  /*  socket.on('taxiAdded', function (taxi) {
      this.taxiMarkers[taxi.taxiId] = this.putTaxiMarker(taxi);
    }.bind(this));

    socket.on('taxiMoved', function (taxi) {
      this.taxiMarkers[taxi.taxiId].setLatLng(taxi.latLong);
    }.bind(this));

      socket.on('taxiQuit', function (taxiId) {
      this.map.removeLayer(this.taxiMarkers[taxiId]);
      Vue.delete(this.taxiMarkers, taxiId);
    }.bind(this));*/


  },
  methods: {
    orderTaxi: function() {
      socket.emit('orderTaxi', { customerDetails: finalInfoArray(),
                              });
                                /* FRÅN MIKAELS KOD
              socket.emit("orderTaxi", { fromLatLong: [this.fromMarker.getLatLng().lat, this.fromMarker.getLatLng().lng],
                                         destLatLong: [this.destMarker.getLatLng().lat, this.destMarker.getLatLng().lng],
                                         orderItems: { passengers: 1, bags: 1, animals: "doge" }
                                       }); */
    },
  }
});
