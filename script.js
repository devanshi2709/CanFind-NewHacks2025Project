function initMap(){
    console.log("initMap loaded!");
    const toronto = { lat: 43.65107, lng: -79.347015 };

    const map = new google.maps.Map(document.getElementById("map"), {
        center: toronto,
        zoom: 12,
    });

    new google.maps.Marker({
        position: toronto,
        map: map,
        title: "Welcome to Toronto!"
    });

    // Create the Places service and an InfoWindow inside initMap so they have access to `map`.
    const service = new google.maps.places.PlacesService(map);
    const infowindow = new google.maps.InfoWindow();

    // Search nearby restaurants and create markers + infowindows for results
    service.nearbySearch(
        {
            location: toronto,
            radius: 1500,
            type: "restaurant",
            keyword: "cheap eats"
        },
        (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                results.forEach(place => {
                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map,
                        title: place.name
                    });

                    google.maps.event.addListener(marker, "click", () => {
                        infowindow.setContent(`<strong>${place.name}</strong><br>${place.vicinity}`);
                        infowindow.open(map, marker);
                    });
                });
            }
        }
    );
}
