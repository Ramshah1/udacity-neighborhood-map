function AppViewModel() {
    "use strict";
    var self = this;

    var clientID = '34NDRXRF2M3Y3CZSYUXCAJ4DU01Q3WDB1HIZ5WBZWA1XRFAZ';
    var clientSecret = 'D0AM0VFCNMEHTYK0XJ5AJF521Q4QJMW4ULYD4OWJ5AQUBJMN';

    function Location(locationdata) {
        this.name = locationdata.name;
        this.latlong = {lat: parseFloat(locationdata.lat), lng: parseFloat(locationdata.long)};
    }

    var contentStart = '<div id="content"><h5>Closest Landmark:</h5><p>';
    var contentEnd = '</p></div>';

    self.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.370, lng: -122.002},
        zoom: 13
    });

    self.locationObjects = [];
    locations.forEach(function (location) {
        self.locationObjects.push(new Location(location))
    });

    function toggleBounceMarker(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 2100);
    }

    var infowindow = new google.maps.InfoWindow({
        content: contentStart + contentEnd
    });

    self.locationObjects.forEach(function (locationInfo) {
        locationInfo.marker = new google.maps.Marker({
            map: self.map,
            position: locationInfo.latlong,
            title: locationInfo.name
        });

        google.maps.event.addListener(locationInfo.marker, 'click', function () {

            toggleBounceMarker(locationInfo.marker);
            infowindow.open(self.map, locationInfo.marker);

            var fourSquareUrl = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&ll=' + locationInfo.latlong.lat + ',' + locationInfo.latlong.lng + '&query=' + locationInfo.name + '&v=20180330';

            // AJAX request.
            $.getJSON(fourSquareUrl, function (data) {
                var info = '<div class="title"><b>' + data.response.venues[0].name + "</b></div>" +
                    '<div class="content">' + data.response.venues[0].location.city + "</div>" +
                    '<div class="content">' + data.response.venues[0].location.state + "</div>" +
                    '<div class="content">' + data.response.venues[0].location.country + "</div>";
                infowindow.setContent(contentStart + info + contentEnd);
            }).error(function () {
                alert("Please check your internet connection and try again.");
            });
        });
        self.visiblePlaces = ko.observableArray();

        // Initialize map with all places.
        self.locationObjects.forEach(function (place) {
            self.visiblePlaces.push(place);
        });

        // This observable tracks user input in the search field.
        self.inputPlace = ko.observable('');

        // To remove non matching place off the map, compare the user input to visiblePlaces array
        self.filterMarkers = function () {
            var searchInput = self.inputPlace().toLowerCase();

            self.visiblePlaces.removeAll();

            // This searches for the user input within the name of each place
            self.locationObjects.forEach(function (place) {
                place.marker.setVisible(false);

                if (place.name.toLowerCase().indexOf(searchInput) !== -1) {
                    self.visiblePlaces.push(place);
                }
            });

            self.visiblePlaces().forEach(function (place) {
                place.marker.setVisible(true);
            });
        };
        self.createInfoWindow = function () {
            google.maps.event.trigger(this.marker, 'click');
        };
    });
}


function initApp() {
    ko.applyBindings(new AppViewModel());
}

function errorHandler() {
    alert('Google Map has failed to load. Please check your internet connection')
}
