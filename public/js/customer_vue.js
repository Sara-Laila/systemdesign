var vm = new Vue({
    el: '#firstCustomerView',
    methods: {
        firstCustomerView: function () {
            var from = document.getElementById("from").value;
            var to = document.getElementById("to").value;

            var carSize = document.getElementsByName("bil");
                for (var i = 0; i < carSize.length; i++) {
                    if (carSize[i].checked) {
                    var size = carSize[i].id;
                    break;
                };
             };

             var firstInfoArray = [from, to, size];
        };
    };
});