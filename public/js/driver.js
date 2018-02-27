/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();
var hamburgerDrawer = document.getElementById('hamburger-menu');
var hamburgerBtn = document.getElementById('hamburger-btn');
var hamburgerDrawerBg = document.getElementById('content');

var directionsDisplay;
var directionsService;

var map, places;
var myplace = {lat: 59.840809, lng: 17.648666};
var myplacemarker;
var dest;
var destmarker;
var placeSearch, autocomplete, autocomplete2;
var geocoder;
var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        postal_town: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
};

var axisCords;
var hamburgerDrawerWidth = hamburgerDrawer.clientWidth;
var oneByForthScreen = window.innerWidth / 4;
var openStatus = false;


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

    myplacemarker.addListener('click', toggleBounce);

    autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */ (
            document.getElementById('autocomplete')), {
                types: ['geocode'],
                componentRestrictions: {'country': 'se'}
            });
    autocomplete2 = new google.maps.places.Autocomplete(
                  /** @type {!HTMLInputElement} */ (
                    document.getElementById('autocomplete2')), {
                        types: ['geocode'],
                        componentRestrictions: {'country': 'se'}
                    });
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}

function codeAddress() {
    var address = document.getElementById('autocomplete').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == 'OK') {
            dest = results[0].geometry.location;
            map.setCenter(dest);
        destmarker = new google.maps.Marker({
            map: map,
            position: dest,
            icon: '/img/markers/green_MarkerB.png',
            animation: google.maps.Animation.DROP
        });


            directionsDisplay.setMap(map);


            calculateAndDisplayRoute(directionsService, directionsDisplay);
            console.log(dest);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var selectedMode = 'DRIVING';
  directionsService.route({
      origin: myplace,
      destination: dest,
    // Note that Javascript allows us to access the constant
    // using square brackets and a string value as its
    // "property."
    travelMode: google.maps.TravelMode[selectedMode]
  }, function(response, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function toggleBounce() {
  if (myplacemarker.getAnimation() !== null) {
    myplacemarker.setAnimation(null);
  } else {
    myplacemarker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function moveMarker() {
}

function geocodeLatLng(geocoder, map, infowindow) {
  var input = document.getElementById('latlng').value;
  var latlngStr = input.split(',', 2);
  var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        map.setZoom(11);
        var marker = new google.maps.Marker({
          position: latlng,
          map: map
        });
        infowindow.setContent(results[0].formatted_address);
        infowindow.open(map, marker);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

/*var vm = new Vue({
    el: '#page',
    data: {
        map: null,
        taxiId: 0,
        taxiLocation: null,
        orders: {},
        customerMarkers: {}
    },
    created: function () {
        socket.on('initialize', function (data) {
            this.orders = data.orders;
        }.bind(this));
        socket.on('currentQueue', function (data) {
            this.orders = data.orders;
        }.bind(this));
        // this icon is not reactive
        this.taxiIcon = L.icon({
            iconUrl: "img/taxi.png",
            iconSize: [36,36],
            iconAnchor: [18,36]
        });
        this.fromIcon = L.icon({
            iconUrl: "img/customer.png",
            iconSize: [36,50],
            iconAnchor: [19,50]
        });

        //Helper function, should probably not be here
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }
        // It's probably not a good idea to generate a random taxi number, client-side.
        this.taxiId = getRandomInt(1, 1000000);
    },
    mounted: function () {
        // set up the map
        this.map = L.map('my-map').setView([59.8415,17.648], 13);

        // create the tile layer with correct attribution
        var osmUrl='http://{s}.tile.osm.org/{z}/{x}/{y}.png';
        var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        L.tileLayer(osmUrl, {
            attribution: osmAttrib,
            maxZoom: 18
        }).addTo(this.map);
        this.map.on('click', this.handleClick);
    },
    beforeDestroy: function () {
        socket.emit('taxiQuit', this.taxiId);
    },
    methods: {
        handleClick: function(event){
            if (openStatus) {
              drawToStart()
            }
            else{
                this.setTaxiLocation()
            }
        },
        setTaxiLocation: function (event) {
            if (this.taxiLocation === null) {
                this.taxiLocation = L.marker([event.latlng.lat, event.latlng.lng], {icon: this.taxiIcon, draggable: true}).addTo(this.map);
                this.taxiLocation.on("drag", this.moveTaxi);
                socket.emit("addTaxi", { taxiId: this.taxiId,
                                         latLong: [event.latlng.lat, event.latlng.lng]
                                       });
            }
            else {
                this.taxiLocation.setLatLng(event.latlng);
                this.moveTaxi(event);
            }
        },
        moveTaxi: function (event) {
            socket.emit("moveTaxi", { taxiId: this.taxiId,
                                      latLong: [event.latlng.lat, event.latlng.lng]
                                    });
        },
        quit: function () {
            this.map.removeLayer(this.taxiLocation);
            this.taxiLocation = null;
            socket.emit("taxiQuit", this.taxiId);
        },
        acceptOrder: function (order) {
            this.customerMarkers = this.putCustomerMarkers(order);
            order.taxiIdConfirmed = this.taxiId;
            socket.emit("orderAccepted", order);
        },
        finishOrder: function (orderId) {
            Vue.delete(this.orders, orderId);
            this.map.removeLayer(this.customerMarkers.from);
            this.map.removeLayer(this.customerMarkers.dest);
            this.map.removeLayer(this.customerMarkers.line);
            Vue.delete(this.customerMarkers);
            socket.emit("finishOrder", orderId);
        },
        putCustomerMarkers: function (order) {
            var fromMarker = L.marker(order.fromLatLong, {icon: this.fromIcon}).addTo(this.map);
            fromMarker.orderId = order.orderId;
            var destMarker = L.marker(order.destLatLong).addTo(this.map);
            destMarker.orderId = order.orderId;
            var connectMarkers = L.polyline([order.fromLatLong, order.destLatLong], {color: 'blue'}).addTo(this.map);
            return {from: fromMarker, dest: destMarker, line: connectMarkers};
        },
    }
    });*/

function drawToStart() {
  hamburgerDrawer.animate([
    {
      transform: `translate3d(${axisCords ? axisCords + 'px' : 0 + 'px'}, 0, 0)`
    },
    {
      transform: 'translate3d(-100%, 0, 0)'
    }
  ], {
      duration: 500,
      easing: 'ease-in-out'
    });
  hamburgerDrawer.style.transform = 'translate3d(-100%, 0, 0)';
  openStatus = false;
}

function drawToEnd() {
  hamburgerDrawer.animate([
    {
      transform: `translate3d(${axisCords ? axisCords + 'px' : -100 + '%'}, 0, 0)`
    },
    {
      transform: 'translate3d(0, 0, 0)'
    }
  ], {
      duration: 500,
      easing: 'ease-in-out'
    });
  hamburgerDrawer.style.transform = 'translate3d(0, 0, 0)';
  openStatus = true;
}

// Click on Menu Button to Drawer
hamburgerBtn.addEventListener('click', drawToEnd);

// Click on Background to Close
hamburgerDrawerBg.addEventListener('click', function(){
  if (openStatus) drawToStart();
});

hamburgerDrawer.addEventListener('touchmove',
  function(e) {
    axisCords = e.changedTouches[0].pageX - hamburgerDrawerWidth;
    if (axisCords > 0) axisCords = 0;
    this.style.transform = 'translate3d(' + axisCords + 'px, 0, 0)';
});

hamburgerDrawer.addEventListener('touchend',
  function(e) {
    var endPoint = e.changedTouches[0].pageX;
    var isOverThreshold = endPoint > oneByForthScreen && endPoint < hamburgerDrawerWidth;
    if (endPoint < oneByForthScreen) {
      drawToStart();
    } else if (isOverThreshold) {
      drawToEnd();
    } else {
      openStatus = true;
    }
    axisCords = null;
  });

/*Javascript for the two customer views*/

var vm = new Vue({
    el: '#CustomerView',
    data: {

    },
    methods: {
        toNextView: function () {
            var from = document.getElementById("fromOne").value;
            var to = document.getElementById("toOne").value;
            moveMarker();

            var carSizeOne = document.getElementsByName("bilOne");
            var carSizeTwo = document.getElementsByName("bilTwo");
                for (var i = 0; i < carSizeOne.length; i++) {
                    if (carSizeOne[i].checked) {
                    carSizeTwo[i].checked = "checked";
                    break;
                };
             };

             document.getElementById("fromTwo").value = from;
             document.getElementById("toTwo").value = to;
             hideShow("firstCustomerView", "secondCustomerView");
        },

        toPayment: function () {
          finalInfoArray();
        }
    },
});


var vm = new Vue ({
    el: "#q-dest",
    data: {
    },
    methods: {
        destinationFirst: function () {
            console.log("You are in the first function");
            var destName = document.getElementById("autocomplete").value;
            if(!destName){
                alert("Invalid address");
                return;
            }
            console.log(destName);
            document.getElementById("toOne").value = destName;
            hideShow("q-dest", "firstCustomerView");
            codeAddress();
        }
    },
});


function finalInfoArray() {
    var from = document.getElementById("fromTwo").value;
    var to = document.getElementById("toTwo").value;

    var carSizeTwo = document.getElementsByName("bilTwo");
    for (var i = 0; i < carSizeTwo.length; i++) {
        if (carSizeTwo[i].checked) {
            var carSizeValue = carSizeTwo[i].value;
            break;
        };
    };
    var phoneNumber = document.getElementById("tel").value;
    var paymentOption = document.getElementsByName("pay");
    for (var i = 0; i < paymentOption.length; i++) {
        if (paymentOption[i].selected) {
            var pay = paymentOption[i].id;
            break;

        };
    };
    var infoArray = [from, to, carSizeValue, phoneNumber, pay];
    console.log(infoArray);

    var listItem = document.createElement("ul");

    for (var i = 0; i < infoArray.length; i++) {
      var dot = document.createElement("li")
      dot.appendChild(document.createTextNode(infoArray[i]));
      listItem.appendChild(dot);
    };
    document.getElementById("kvittoInfo").appendChild(listItem);

    hideShow("secondCustomerView", "kvitto");
}

function hideShow(toHide, toShow) {
    var x = document.getElementById(toHide);
    var y = document.getElementById(toShow);
    x.style.display = "none";
    y.style.display = "block";
}

    $(document).ready(function(){
      $("#firstBtn").click(function(){
        var selectedValue = $("input[name=serviceType]:checked").val();
        console.log(selectedValue);
          if (selectedValue == "färdtjänst"){
            $("#färdtjänstModal").modal();
          } else {
              $("#secondModalView").modal();
          }
      });
  });
