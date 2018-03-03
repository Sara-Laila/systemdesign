/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

//for current job gps
var to;
var from;

var vm = new Vue({
  el: '#drivercontent',
  data: {
    buttonId: "logginButton",
    loggText: "Logga in",
    currentJobs: "#job",
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
          console.log(data.orders)
            this.orders = data.orders;
            for(var order in this.orders){
              if(this.taxiId == this.orders[order].taxiId){
                $("#currentJobModal").modal();
              }



            }


        }.bind(this));




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


    },
    methods: {
        loggInLoggOff: function() {
          //this.loggText är det som står på knappen
          //logga in == föraren är utloggad
          if (this.loggText == "Logga in") {
            this.loggText = "Logga ut";
            changeHeaderColor("#5cb85c");
            this.setTaxiLocation();
            //socket.emit('addTaxi', {"123"}); addTaxi! TODO
          } else {
            this.loggText = "Logga in";
            changeHeaderColor("white");
            this.quit();
            //Here messages to dispather should be sent - removeTaxi! TODO
          }
        },
        setTaxiLocation: function () {
          /* TODO! FRÅN MIKAELS SKELETTKOD
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
            */
            socket.emit("addTaxi", { taxiId: this.taxiId
                                   });
        },
        moveTaxi: function (event) {
          /* TODO! FRÅN MIKAELS SKELETTKOD
            socket.emit("moveTaxi", { taxiId: this.taxiId,
                                      latLong: [event.latlng.lat, event.latlng.lng]
                                    });*/
        },
        quit: function () {
            socket.emit("taxiQuit", this.taxiId);
        },
        acceptOrder: function (order) {
          console.log(order);
          console.log(order.customerDetails[0]);
          console.log(order.customerDetails[1]);
            order.taxiIdConfirmed = this.taxiId;
            from = order.customerDetails[0];
            to = order.customerDetails[1];
            codeAddress();
            socket.emit("orderAccepted", order);
        },
        finishOrder: function (orderId) {
            Vue.delete(this.orders, orderId);
            socket.emit("finishOrder", orderId);
        },
        putCustomerMarkers: function (order) {

        },
    },
});

/*******/
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
function hideDivs(divToHide) {
  var x = document.getElementById(divToHide);
  if (x.style.display === "none") {
      x.style.display = "block";
  } else {
      x.style.display = "none";
  }
};
function hideAndShow(toHide, toShow) {
    var x = document.getElementById(toHide);
    var y = document.getElementById(toShow);
    x.style.display = "none";
    y.style.display = "block";
};


function changeHeaderColor(color) {
  document.getElementById("taxiid").style.backgroundColor = color;
}

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

function codeAddress(address) {
    geocoder.geocode( { 'address': to}, function(results, status) {
        if (status == 'OK') {
            to = results[0].geometry.location;
        /*destmarker = new google.maps.Marker({
            map: map,
            position: dest,
            icon: '/img/markers/green_MarkerB.png',
            animation: google.maps.Animation.DROP
        });*/

      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

      geocoder.geocode( { 'address': from}, function(results, status) {
          if (status == 'OK') {
              from = results[0].geometry.location;
          /*destmarker = new google.maps.Marker({
              map: map,
              position: dest,
              icon: '/img/markers/green_MarkerB.png',
              animation: google.maps.Animation.DROP
          });*/

        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
    });

    directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById('directionsPanel'));
    calculateAndDisplayRoute(directionsService, directionsDisplay);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var selectedMode = 'DRIVING';
  directionsService.route({
      origin: from,
      destination: to,
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
