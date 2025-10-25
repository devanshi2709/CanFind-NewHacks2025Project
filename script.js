function initMap() {
    console.log("initMap loaded!");
    const toronto = { lat: 43.65107, lng: -79.347015 };

    const map = new google.maps.Map(document.getElementById("map"), {
        center: toronto,
        zoom: 14,
    });

    const service = new google.maps.places.PlacesService(map);
    const infowindow = new google.maps.InfoWindow();

    searchRestaurants({
        location: toronto,
        radius: 5000,
        type: "restaurant",
    }, service, map, infowindow);
}

function searchRestaurants(request, service, map, infowindow) {
    service.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(place => {
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map,
                    title: place.name
                });

                marker.addListener("click", () => {
                    infowindow.setContent(`<strong>${place.name}</strong><br>${place.vicinity}`);
                    infowindow.open(map, marker);
                });
            });

            // If there are more results, fetch next page
            if (pagination && pagination.hasNextPage) {
                setTimeout(() => {
                    pagination.nextPage();
                }, 2000);
            }
        } else {
            console.log("Places API status:", status);
        }
    });
}
