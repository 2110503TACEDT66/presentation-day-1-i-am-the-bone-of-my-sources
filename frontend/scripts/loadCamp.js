async function loadCamp() {
    const allCampsLocation = await fetch('/api/v1/campgrounds/locations');

    const data = await allCampsLocation.json();

    for (let i = 0; i < data.data.length; i++) {
        try {
            const camp = data.data[i];
            const campCoordinates = camp.location.coordinates;

            const lat = campCoordinates[1];
            const lng = campCoordinates[0];

            L.marker([lat, lng], { icon: greenIcon })
                .bindPopup(camp.name)
                .addTo(map);
        } catch (err) {
            console.log(err);
        }
    }
}

var greenIcon = new L.Icon({
    iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

loadCamp();
