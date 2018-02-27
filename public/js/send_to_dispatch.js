'use strict';
var socket = io();

var vm = new Vue({
  el: '#fullContactForm',
  data: {
    orders: {},
    position: {x:0, y:0},
  },
  methods: {
    getNext: function () {
      var lastOrder = Object.keys(this.orders).reduce( function (last, next) {
        return Math.max(last, next);
      }, 0);
      return lastOrder + 1;
    },
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
