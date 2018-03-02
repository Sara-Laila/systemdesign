'use strict';
var socket = io();

var vm = new Vue({
  el: '#secondModalView',
  data: {
    orders: {},
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
                                customerDetails: finalInfoArray(),
                              });
    }
  }
});
