const allMarkers = [];
let map;
let service;
let infowindow;


function initMap() {
    console.log("initMap loaded!");
    const toronto = { lat: 43.6615, lng: -79.4009 };

    const map = new google.maps.Map(document.getElementById("map"), {
        center: toronto,
        zoom: 14,
    });

    const service = new google.maps.places.PlacesService(map);
    const infowindow = new google.maps.InfoWindow();
    const allMarkers = [];


    searchRestaurants({
        location: toronto,
        radius: 5000,
        type: "restaurant",
        keyword: "",
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
                
                marker.price_level = place.price_level;
                marker.types = place.types;
                marker.name = place.name.toLowerCase();

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
                allMarkers.push(marker);
            });

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

function updateMarkers(filterFn) {

    let shown = 0;
    allMarkers.forEach(marker => {
        if (filterFn(marker)) {
        marker.setMap(map);
        marker.visible = true;
        shown++;
        } else {
        marker.setMap(null);
        marker.visible = false;
        }
    });
    console.log("updateMarkers -> shown:", shown, "of", allMarkers.length);
}


function showCheap() {
    updateMarkers(marker => marker.price_level != null && marker.price_level <= 2 );
}

function showCanadian() {
    updateMarkers(marker => marker.name.includes("canadian") || marker.types.includes("canadian_restaurant") );
}

function showAll() {
    updateMarkers(marker => true );
}

function resetMarkers() {

}