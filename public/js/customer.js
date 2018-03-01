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

function showWhereTo() {
  console.log("I showWhereTo");
  console.log(autocomplete);
  console.log(autocomplete2);
  var from = document.getElementById("autocomplete").value;
  var to =document.getElementById("autocomplete2").value;

  var placeToPut = document.getElementById("whereTo");
  var paragraph1 = document.createElement("p")
  var paragraph2 = document.createElement("p")
  var fromText = document.createTextNode("Från " + from);
  var toText = document.createTextNode("Till " + to);
  paragraph1.appendChild(fromText);
  paragraph2.appendChild(toText);
  placeToPut.appendChild(paragraph1);
  placeToPut.appendChild(paragraph2);

  var whatService = getTypeOfService();
  if (whatService == "taxi") {
      hideDivs("special");
      hideDivs("personalNum");
  } else {
    hideDivs("carType");
  }
};

var hideDivs = function(divToHide) {
    var x = document.getElementById(divToHide);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
var hideClass = function(classToHide) {
    var x = document.getElementsByClassName(classToHide);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
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

/*
var vm = new Vue({
  el: '#page',
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
    socket.on('taxiAdded', function (taxi) {
      this.taxiMarkers[taxi.taxiId] = this.putTaxiMarker(taxi);
    }.bind(this));

    socket.on('taxiMoved', function (taxi) {
      this.taxiMarkers[taxi.taxiId].setLatLng(taxi.latLong);
    }.bind(this));

    socket.on('taxiQuit', function (taxiId) {
      this.map.removeLayer(this.taxiMarkers[taxiId]);
      Vue.delete(this.taxiMarkers, taxiId);
    }.bind(this));

    // These icons are not reactive
    this.taxiIcon = L.icon({
      iconUrl: "img/taxi.png",
      iconSize: [36,36],
      iconAnchor: [18,36],
      popupAnchor: [0,-36]
    });

    this.fromIcon = L.icon({
          iconUrl: "img/customer.png",
          iconSize: [36,50],
          iconAnchor: [19,50]
        });
  },
  mounted: function () {
    // set up the map
    this.map = new google.maps.Map(document.getElementById('map'), {

    zoom: 14,
      center: polacks,
    disableDefaultUI: true
  });

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    L.tileLayer(osmUrl, {
        attribution: osmAttrib,
        maxZoom: 18
    }).addTo(this.map);
    this.map.on('click', this.handleClick);

    var searchDestControl = L.esri.Geocoding.geosearch({allowMultipleResults: false, zoomToResult: false, placeholder: "Destination"}).addTo(this.map);
    var searchFromControl = L.esri.Geocoding.geosearch({allowMultipleResults: false, zoomToResult: false, placeholder: "From"});
    // listen for the results event and add the result to the map
    searchDestControl.on("results", function(data) {
        this.destMarker = L.marker(data.latlng, {draggable: true}).addTo(this.map);
        this.destMarker.on("drag", this.moveMarker);
        searchFromControl.addTo(this.map);
    }.bind(this));

    // listen for the results event and add the result to the map
    searchFromControl.on("results", function(data) {
        this.fromMarker = L.marker(data.latlng, {icon: this.fromIcon, draggable: true}).addTo(this.map);
        this.fromMarker.on("drag", this.moveMarker);
        this.connectMarkers = L.polyline([this.fromMarker.getLatLng(), this.destMarker.getLatLng()], {color: 'blue'}).addTo(this.map);
    }.bind(this));
  },
  methods: {
    putTaxiMarker: function (taxi) {
      var marker = L.marker(taxi.latLong, {icon: this.taxiIcon}).addTo(this.map);
      marker.bindPopup("Taxi " + taxi.taxiId);
      marker.taxiId = taxi.taxiId;
      return marker;
    },
    orderTaxi: function() {
            socket.emit("orderTaxi", { fromLatLong: [this.fromMarker.getLatLng().lat, this.fromMarker.getLatLng().lng],
                                       destLatLong: [this.destMarker.getLatLng().lat, this.destMarker.getLatLng().lng],
                                       orderItems: { passengers: 1, bags: 1, animals: "doge" }
                                     });
    },
      handleClick: function (event) {
          if (openStatus) {
              drawToStart()
              return;
          }
      // first click sets destination
      if (this.destMarker === null) {
        this.destMarker = L.marker([event.latlng.lat, event.latlng.lng], {draggable: true}).addTo(this.map);
        this.destMarker.on("drag", this.moveMarker);
      }
      // second click sets pickup location
      else if (this.fromMarker === null) {
        this.fromMarker = L.marker(event.latlng, {icon: this.fromIcon, draggable: true}).addTo(this.map);
        this.fromMarker.on("drag", this.moveMarker);
        this.connectMarkers = L.polyline([this.fromMarker.getLatLng(), this.destMarker.getLatLng()], {color: 'blue'}).addTo(this.map);
      }
    },
    moveMarker: function (event) {
      this.connectMarkers.setLatLngs([this.fromMarker.getLatLng(), this.destMarker.getLatLng()], {color: 'blue'});
      //socket.emit("moveMarker", { orderId: event.target.orderId,
                                //latLong: [event.target.getLatLng().lat, event.target.getLatLng().lng]
                              //  });

    }
  }
});
 */
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

/*var vm = new Vue({
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
});*/


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


var getTypeOfService = function() {
  var service = document.getElementsByName("typeOfService");
  for (var i = 0; i < service.length; i++) {
      if (service[i].checked) {
          var serviceValue = service[i].value;
          break;
      };
  };
  return serviceValue;
}

$('#q-dest').keypress(function(e){

    if (e.which == 13) {
        callModal("#firstOrderModal");
    }

});

function callModal(modal){
    $(modal).modal()

}

function finalInfoArray() {
  console.log("entered finalInfoArray");
  //get address
    var from = document.getElementById("autocomplete").value;
    var to = document.getElementById("autocomplete2").value;
//get type of serviceType
    var serviceType = getTypeOfService();
//get car size
  if(serviceType == "taxi") {
    var carSizeTwo = document.getElementsByName("car");
    for (var i = 0; i < carSizeTwo.length; i++) {
        if (carSizeTwo[i].checked) {
            var carSizeValue = carSizeTwo[i].value;
            break;
        };
    };
  }
//get phoneNumber, date, pickupTime, paymentOption
    var phoneNumber = document.getElementById("tel").value;
    var date = document.getElementById("date").value;
    var time = document.getElementById("pickupTime").value;
    var pay = getInfoFromDropdown("pay");
    //get extra info if serviceType=färdtjänst
    if (serviceType == "färdtjänst") {
      var specialDemands = getSpecialDemands();
      var numPassengers = getNumberOfPassengers();
      var pNumber = document.getElementById("perNum").value;
      var infoArray = [from, to, serviceType, specialDemands, numPassengers, pNumber, phoneNumber, date, time, pay];
    } else {
      var infoArray = [from, to, serviceType, carSizeValue, phoneNumber, date, time, pay];
    }
    console.log(infoArray);
    return infoArray;
};

function createInfoList(placeToPut) {
  var infoArray = finalInfoArray();
  var listItem = document.createElement("ul");

  for (var i = 0; i < infoArray.length; i++) {
    var dot = document.createElement("li")
    dot.appendChild(document.createTextNode(infoArray[i]));
    listItem.appendChild(dot);
  }
  document.getElementById(placeToPut).appendChild(listItem);
}

function getSpecialDemands() {
  var choices = document.getElementsByName("specialChoice");
  var choicesValue = [];
  for (var i = 0; i < choices.length; i++) {
    if(choices[i].checked) {
      choicesValue += choices[i].value + ", ";
    }
  }
  return choicesValue;
}
function getInfoFromDropdown(name) {
  var options = document.getElementsByName(name);
  for (var i = 0; i < options.length; i++) {
      if (options[i].selected) {
          var selectedOption = options[i].id;
          break;
      };
  };
  return selectedOption;
}
function getNumberOfPassengers() {
  var adults = getInfoFromDropdown("passengers");
  var children = getInfoFromDropdown("passengers2");
  var total = ["vuxna: "+ adults, "barn: "+ children];
  return total;
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

/*Skicka orderns till servern*/
function getInfo() {
  var tel = document.getElementById("tel").value;
  console.log(tel);
  var payOpt = document.getElementsByName("pay");
  console.log(payOpt);
  for (var i = 0; i < payOpt.length; i++) {
    if (payOpt[i].selected) {
      var payment = payOpt[i].id;
    };
  };
  var array = [tel, payment];
   console.log(array);

   return array;

}

var send = new Vue({
  el: '#secondModalView',
  data: {
    orderId: Math.floor(1000 + Math.random() * 9000),
    position: {x:0, y:0},
  },
  methods: {
    sendOrder: function () {
          console.log("Är i sendOrder");
          /*Här skickas allti iväg, lägg till i getInfo() vad som behövs*/
      socket.emit("addOrder", { orderId: this.orderId,
                                details: { x: this.position.x, y: this.position.y},
                                customerInfo: getInfo(),
                              });
      console.log(this.orderId);
    }
  }
});
