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
                    service.getDetails({
                        placeId: place.place_id,
                        fields: [
                            "name",
                            "formatted_address",
                            "formatted_phone_number",
                            "website",
                            "opening_hours",
                            "price_level",
                            "rating"
                        ]
                    }, (details, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            const content = `
                                <strong>${details.name}</strong><br>
                                ${details.formatted_address || ""}<br>
                                Phone: ${details.formatted_phone_number || "N/A"}<br>
                                Website: ${details.website ? `<a href="${details.website}" target="_blank">Link</a>` : "N/A"}<br>
                                Rating: ${details.rating || "N/A"}<br>
                                Price: ${details.price_level != null ? "$".repeat(details.price_level) : "N/A"}
                            `;
                            infowindow.setContent(content);
                            infowindow.open(map, marker);
                        } else {
                            infowindow.setContent("Details unavailable");
                            infowindow.open(map, marker);
                        }
                    });
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
