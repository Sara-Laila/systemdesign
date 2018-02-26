/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

/*MAP stuff ---------------------------------*/

var directionsDisplay;
var directionsService;

var map, places;
var myplace = {lat: 59.840809, lng: 17.648666};
var myplacemarker;
var dest;
var destmarker;
var placeSearch, autocomplete;
var geocoder;
var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        postal_town: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
};

/*------------------------------------------*/
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
}
/*----------------------------------------------------*/




function show(toShow) {
    var y = document.getElementById(toShow);
    if (y.style.display == "block") {
      y.style.display = "none";
    }
    else { 
      y.style.display = "block";
    }
}