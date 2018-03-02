'use strict';
var socket = io();

var vm = new Vue({
    el: '#q-dest',
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
            for (var taxiId in data.taxis) {
                this.taxiMarkers[taxiId] = this.putTaxiMarker(data.taxis[taxiId]);
            }
        }.bind(this));
        socket.on('orderId', function (orderId) {
            this.orderId = orderId;
        }.bind(this));
    }
    methods: {
        addOrder: function (event) {
            console.log("Är i addOrder");

            socket.emit("addOrder", { orderId: this.getNext(),
                                      details: { x: this.position.x, y: this.position.y},
                                      orderItems: readOrderItems(),
                                      customerDetails: readCustomerInfo(),
                                    });
            displayOrderInfo(readCustomerInfo(), this.position.x, this.position.y);
        }
    }
});
