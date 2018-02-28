var vm = new Vue({
    el: 'whereTo',
    methods: {
        showWhereTo: function() {
          var from = document.getElementById("autocomplete").value;
          var to =document.getElementById("autocomplete2").value;

          var placeToPut = document.getElementById("whereTo");
          var fromText = document.createTextNode(from);
          var toText = document.createTextNode(to);
          placeToPut.appendChild(fromText);
          placeToPut.appendChild(toText);

        }
    };
});
