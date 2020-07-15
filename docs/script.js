let macarte;

document.addEventListener("DOMContentLoaded", function (event) {
    console.log('Ready to go !');

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    console.log(vw + ";" + vh)

    let h = window.innerHeight - document.getElementById("container").clientHeight;
    console.log(h);
    document.getElementById('map').style.height = vh - 64 - 32 + "px"
    document.getElementById('map').style.width = vw -32 + "px"
    initMap();
});

function initMap() {
    // Hostens <3
    var lat = 44.492933;
    var lon = -0.639850;

    macarte = L.map('map').setView([lat, lon], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20
    }).addTo(macarte);
}