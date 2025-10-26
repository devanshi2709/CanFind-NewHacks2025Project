let allMarkers = [];
let map;
let service;
let infowindow;

function initMap() {
    console.log("initMap loaded!");
    const toronto = { lat: 43.6615, lng: -79.4009 };

    map = new google.maps.Map(document.getElementById("map"), {
        center: toronto,
        zoom: 14,
    });

    service = new google.maps.places.PlacesService(map);
    infowindow = new google.maps.InfoWindow();

    searchRestaurants({
        location: toronto,
        radius: 5000,
        type: "restaurant",
    });
}

function searchRestaurants(request) {
    service.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(place => createMarkerFromPlace(place));

            if (pagination && pagination.hasNextPage) {
                setTimeout(() => pagination.nextPage(), 1500);
            }
        } else {
            console.warn("Places API status:", status);
        }
    });
}

function createMarkerFromPlace(place) {
    if (allMarkers.some(m => 
        m.title === place.name &&
        google.maps.geometry &&
        google.maps.geometry.spherical.computeDistanceBetween(
            m.getPosition(), place.geometry.location
        ) < 20
    )) {
        return;
    }

    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map,
        title: place.name,
    });

    marker.price_level = place.price_level;
    marker.types = place.types || [];
    marker.name = (place.name || "").toLowerCase();

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
                "rating",
                "editorial_summary"

            ]
        }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const summary = details.editorial_summary?.overview || "N/A";

                const content = `
                    <strong>${details.name}</strong><br>
                    ${details.formatted_address || ""}<br>
                    Phone: ${details.formatted_phone_number || "N/A"}<br>
                    Website: ${details.website ? `<a href="${details.website}" target="_blank">Link</a>` : "N/A"}<br>
                    Rating: ${details.rating || "N/A"}<br>
                    Price: ${details.price_level != null ? "$".repeat(details.price_level) : "N/A"}<br>
                    Summary: ${summary}
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
}

function clearMarkers() {
    allMarkers.forEach(m => m.setMap(null));
    allMarkers = [];
}

function searchByCuisine(cuisine) {
    clearMarkers();
    const toronto = { lat: 43.6615, lng: -79.4009 };
    const request = {
        location: toronto,
        radius: 5000,
        type: "restaurant",
        keyword: cuisine,
    };
    console.log("Searching for:", cuisine);
    searchRestaurants(request);
}


function showAll() {
    updateMarkers(() => true);
}

function updateMarkers(filterFn) {
    let shown = 0;
    allMarkers.forEach(marker => {
        if (filterFn(marker)) {
            marker.setMap(map);
            shown++;
        } else {
            marker.setMap(null);
        }
    });
    console.log(`updateMarkers → shown ${shown} of ${allMarkers.length}`);
}

function showCheap() {
    updateMarkers(m => m.price_level != null && m.price_level <= 2);
}


function showCheap() {
    updateMarkers(marker => marker.price_level != null && marker.price_level <= 2);
}

function showCanadian() {
    searchByCuisine("canadian food");
    /*updateMarkers(marker =>
        marker.name.includes("canadian") ||
        marker.types.includes("canadian_restaurant")
    );*/
}

function showChinese() {
    searchByCuisine("chinese food");
}

function showItalian() {
    searchByCuisine("italian food");
}

function showIndian() {
    searchByCuisine("indian food");
}

function showAll() {
    updateMarkers(() => true);
}

function changeLanguage(langCode) {
    console.log("Changing map language to:", langCode);

    const oldScript = document.getElementById("google-maps-script");
    if (oldScript) oldScript.remove();

    const newScript = document.createElement("script");
    newScript.id = "google-maps-script";
    newScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA81uxRaknk0hRxBxflcXjLjsSoM6Mz1F4&libraries=places,geometry&callback=initMap&language=${langCode}`;
    newScript.async = true;
    newScript.defer = true;

    document.body.appendChild(newScript);
}
