import React, { useEffect } from "react";

function MapCreate() {
  useEffect(() => {
    // Load Google Maps API script with callback=initMap
    const mapCode = document.createElement("script");
    mapCode.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyA81uxRaknk0hRxBxflcXjLjsSoM6Mz1F4&libraries=places&callback=initMap";
    mapCode.async = true;
    mapCode.defer = true;
    document.body.appendChild(mapCode);

    // Define global initMap function called by Google Maps API
    window.initMap = () => {
      // Load your local script.js only after Google Maps API is ready
      const localScript = document.createElement("script");
      localScript.src = "/script.js";
      document.body.appendChild(localScript);
    };

    // Cleanup on unmount
    return () => {
      document.body.removeChild(mapCode);
      // Optionally remove localScript if you track it here
      delete window.initMap;
    };
  }, []);

  return (
    <div>
      <h2>Nearby Restaurants Map</h2>
      <div id="map" style={{ width: "100%", height: "600px" }}></div>
    </div>
  );
}

export default MapCreate;
