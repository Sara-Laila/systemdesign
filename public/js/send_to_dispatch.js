'use strict';
var socket = io();

var vm1 = new Vue({
  el: '#secondModalView',
  data: {
    orderId: null,
    customerId: null,
    taxiId: 0,
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

    socket.on('customerId', function (customerId) {
      this.customerId = customerId;
      console.log(this.customerId)
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
      var array = finalInfoArray();
      var customerId = array[5];
      socket.emit('orderTaxi', { customerDetails: array,
                                 customerId: customerId,
                              });
                                /* FRÅN MIKAELS KOD
              socket.emit("orderTaxi", { fromLatLong: [this.fromMarker.getLatLng().lat, this.fromMarker.getLatLng().lng],
                                         destLatLong: [this.destMarker.getLatLng().lat, this.destMarker.getLatLng().lng],
                                         orderItems: { passengers: 1, bags: 1, animals: "doge" }
                                       }); */
    },
  }
});

var vm2 = new Vue({
  el: '#tidigareBokningar',
  data: {
    customerId: null,
    orders: {},
    previousOrders: {},
  },
  created: function () {
    socket.on('initialize', function (data) {
      this.orders = data.orders;
      console.log(this.orders[1001]);
    }.bind(this));
  },
  methods: {
    gatherBookings: function() {
    console.log("Är i gatherBookings");
    var id = vm1.customerId;
    console.log(id);
    var array = Object.values(this.orders);
    var length = array.length;
    console.log(length);
    for (var i = 0; i < length; i++) {
      var obj = array[i];
      var customerId = obj.customerId;
      if (customerId == id) {
        this.previousOrders[obj.orderId] = obj;
        console.log(obj.orderId);
      }
    }
    vm3.setData();
    }
  }
});
var vm3 = new Vue({
  el: '#tidigareBokningarModal',
  data: {
    customerId: 0,
    previousOrders: {},
    selected: '',
  },
  methods: {
    editOrder: function (order) {

    },
    setData: function() {
      console.log("är i vm3");
      this.customerId = vm1.customerId;
      this.previousOrders = vm2.previousOrders;
    }
  }
});
