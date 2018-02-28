function initMap() {
  var polacks = {lat: 59.845, lng: 17.648};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: polacks
  });
  var marker = new google.maps.Marker({
    position: polacks,
    map: map
  });
}
