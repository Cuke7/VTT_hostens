let macarte;

// Index of current selected point d'interêt
let selected_point_interet;

// Points de passage ajoutés à la route en création
let points_passage = [];

// Skack bar text element
let snackbar_text = document.getElementById('current_route_info');

// Info card that display picture of the point d'intérêt
let info_card = document.getElementById('my_info_card')

// Image de l'inf card
let card_image = document.getElementById('my_card_image')

// Contient tout les point d'intérêts
var markers = new L.FeatureGroup();

// TEMP
var geojson_layer = L.geoJSON();


document.addEventListener("DOMContentLoaded", function (event) {

    console.log('Ready to go !');

    initMap();
    show_point_interet();

    document.getElementById('file').addEventListener('change', handleFileSelect, false);

    // Affiche le premier marker qui est sélectionné d'office en rouge
    markers.getLayers()[0].setIcon(red_pin);

    // TEMP
    geojson_layer.addTo(macarte);
});

// Initialise et affiche la carte
function initMap() {

    // Ajuste la carte à la taille de l'écran
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    document.getElementById('map').style.height = vh - 64 - 32 + "px"
    document.getElementById('map').style.width = vw - 32 + "px"

    // Hostens <3

    var lat = 44.501758;
    var lon = -0.641500;

    macarte = L.map('map').setView([lat, lon], 15);


    // Pour la vue satellite
    var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
        mqi = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] });

    var baseMaps = {
        "Open Street view": osm,
        "Satellite view": mqi
    };
    var overlays = {};
    L.control.layers(baseMaps, overlays, { position: 'bottomleft' }).addTo(macarte);
    osm.addTo(macarte)
}

// Affiche tout les points d'intérêt sur la carte
function show_point_interet() {
    for (const point_interet of point_interets) {
        var m = L.marker([point_interet.pos[0], point_interet.pos[1]],
            {
                point_interet: point_interet,
                icon: blue_pin,
            }).on('click', click_marker);

        m.bindTooltip("#" + point_interet.index + " " + point_interet.name, { permanent: true, direction: "top" });
        markers.addLayer(m);
        macarte.addLayer(markers);
    }
}

// Called when a marker is clicked
function click_marker(e) {

    //reset all icons back to normal
    for (const marker of markers.getLayers()) {
        marker.setIcon(blue_pin);
    }

    show_card();
    let img_url = this.options.point_interet.img;
    selected_point_interet = this.options.point_interet;
    card_image.src = "./pics/" + img_url;
    console.log(selected_point_interet);

    // Affiche le marler cliqué en rouge
    this.setIcon(red_pin);
}

function show_card() {
    info_card.classList.remove("hidden");
}

function hide_card() {
    info_card.classList.add("hidden");
}

function show_snack(text) {
    snackbar_text.innerHTML = text;
    window.snackbar.open();
}

function handleFileSelect(evt) {

    var geojsonFeature_upload = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "LineString",
            "coordinates": []
        }
    };

    let tab = [];
    var file = evt.target.files; // FileList object
    var selectedFile = document.getElementById('file').files[0];
    console.log(selectedFile);
    var reader = new FileReader();

    reader.onload = function (event) {

        let temp = reader.result.split("\n");
        for (var i = 0; i < temp.length; i++) {
            tab.push(temp[i].split(","));
        }

        // Last line doesn't contain info
        tab.pop();
        for (const line of tab) {
            if (!isNaN(line[1]) && !isNaN(line[0])) {
                let temp = [Number(line[1].trim()), Number(line[0].trim())];
                geojsonFeature_upload.geometry.coordinates.push(temp)
            }
        }
        geojson_layer.clearLayers();
        drawer.open = false;
        geojson_layer.addData(geojsonFeature_upload);
        show_snack("Data loaded");
        analyse(geojsonFeature_upload);
    };
    reader.readAsText(selectedFile);
}

function analyse(geojsonFeature_upload) {
    for (const point_interet of point_interets) {
        let dist = 100000000;
        last_index = 0;
        for (let i = 0; i < geojsonFeature_upload.geometry.coordinates.length; i++) {
            let point = [geojsonFeature_upload.geometry.coordinates[i][1], geojsonFeature_upload.geometry.coordinates[i][0]];
            if (macarte.distance(point, point_interet.pos) < dist) {
                dist = macarte.distance(point, point_interet.pos);
                last_index = i
            }
        }
        // Si on passe à moins de 15 m du point d'intérêt
        if (dist < 20) {
            console.log(point_interet.index + " -> " + last_index + " : " + dist)
        }
    }
}


function create_data_file() {
}