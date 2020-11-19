let macarte;

// Index of current selected point d'interêt
let selected_point_interet;

// Skack bar text element
let snackbar_text = document.getElementById('current_route_info');

// Info card that display picture of the point d'intérêt
let info_card = document.getElementById('my_info_card')

// Image de l'inf card
let card_image = document.getElementById('my_card_image')

// Contient tout les point d'intérêts
var markers = new L.FeatureGroup();

// Contient les points d'intérêts sélectionnés comme points de passage
let points_passages = [];

// TEMP
let geojson_layer = L.geoJSON([], {
    style: function (feature) {
        switch (feature.geometry.type) {
            case "LineString": return { color: "#ff0000" };
            case "LineString": return { color: "#0000ff" };
        }
    }
});
let geojson_features = [];

// Contient geojson_features correctement moyenné
let geojson_data = [];


document.addEventListener("DOMContentLoaded", function (event) {

    console.log('Ready to go !');

    initMap();
    show_point_interet();

    document.getElementById('file').addEventListener('change', handleFileSelect, false);

    // TEMP
    geojson_layer.addTo(macarte);

    hide_card();
});

// Initialise et affiche la carte
function initMap() {

    // Ajuste la carte à la taille de l'écran
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    document.getElementById('map').style.height = vh - 64 - 32 + "px"
    document.getElementById('map').style.width = vw - 32 + "px"

    // Hostens <3
    var lat = 44.501060;
    var lon = -0.637508;

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
    clean_markers();

    show_card();
    let img_url = this.options.point_interet.img;
    selected_point_interet = this.options.point_interet;
    card_image.src = "./pics/" + img_url;
    console.log(selected_point_interet);

    // Affiche le marler cliqué en rouge
    this.setIcon(red_pin);
}

function clean_markers() {
    for (const marker of markers.getLayers()) {
        marker.setIcon(blue_pin);
    }
}

function show_card() {
    info_card.classList.remove("hidden");
}

function hide_card() {
    info_card.classList.add("hidden");
    clean_markers();
}

function show_snack(text) {
    snackbar_text.innerHTML = text;
    window.snackbar.open();
}

function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object

    let readers = [];

    for (const selectedFile of files) {
        readers.push(new FileReader());
    }

    for (const reader of readers) {
        reader.onload = function (event) {

            var geojsonFeature_upload = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
                }
            };
            let tab = [];

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
            //geojson_layer.clearLayers();
            drawer.open = false;
            geojson_layer.addData(geojsonFeature_upload);
            show_snack("Data loaded");
            let results = analyse(geojsonFeature_upload).sort((a, b) => (a.last_index > b.last_index) ? 1 : ((b.last_index > a.last_index) ? -1 : 0));
            console.table(results);

            let coords = geojsonFeature_upload.geometry.coordinates;

            for (let i = 1; i < results.length; i++) {
                let pair = [results[i - 1].start, results[i].start];
                let temp = [];
                if (pair[1] < pair[0]) {
                    let temp2 = pair[0];
                    pair[0] = pair[1];
                    pair[1] = temp2;
                    for (let index = results[i].last_index; index > results[i - 1].last_index; index--) {
                        temp.push(coords[index]);
                    }
                } else {
                    for (let index = results[i - 1].last_index; index < results[i].last_index; index++) {
                        temp.push(coords[index]);
                    }
                }

                let pushed = false;

                for (const geojson_feature of geojson_features) {
                    if (geojson_feature.properties.start == pair[0] && geojson_feature.properties.end == pair[1]) {
                        pushed = true;
                        geojson_feature.geometry.coordinates.push(temp);
                    }
                }

                if (!pushed) {
                    geojson_features.push({
                        "type": "Feature",
                        "properties": {
                            "start": pair[0],
                            "end": pair[1],
                        },
                        "geometry": {
                            "type": "MultiLineString",
                            "coordinates": [temp],
                        }
                    })
                }

            }

            geojson_layer.clearLayers();
            for (const geojson of geojson_features) {
                geojson_layer.addData(geojson);
            }

        };
    }

    for (let i = 0; i < files.length; i++) {
        readers[i].readAsText(files[i]);
    }

    document.getElementById('file').value = "";
}

function analyse(geojsonFeature_upload) {
    let results = [];
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
        // Si on passe à moins de 25 m du point d'intérêt
        if (dist < 25) {
            results.push({
                start: point_interet.index,
                last_index: last_index,
            })
        }
    }
    return results;
}

function saveText(text, filename) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
}

//var obj = { a: "Hello", b: "World" };
//saveText(JSON.stringify(obj), "filename.json");


function moyenne() {

    for (const geojson_feature of geojson_features) {

        let temp_geojson_array = [];

        for (const coords of geojson_feature.geometry.coordinates) {
            temp_geojson_array.push({
                "type": "Feature",
                "properties": {
                    "start": geojson_feature.properties.start,
                    "end": geojson_feature.properties.end,
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords,
                }
            })
        }

        let lengths = temp_geojson_array.map(geojson => turf.length(geojson));

        let ouput = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [],
            }
        }

        for (let i = 1; i < 1000; i++) {

            let ps = [];

            for (let index = 0; index < temp_geojson_array.length; index++) {
                ps.push(turf.along(temp_geojson_array[index], i / 1000 * lengths[index]));
            }
            let p_moy = turf.center(turf.featureCollection(ps));
            ouput.geometry.coordinates.push(p_moy.geometry.coordinates);
        }

        var myStyle = {
            "color": "#ff7800",
            "weight": 5,
            "opacity": 0.65
        };

        geojson_layer.addData(ouput);
    }
}

function clear_map() {
    geojson_layer.clearLayers();
    show_snack('Map cleared')
}


function add_point_passage() {
    points_passages.push(selected_point_interet);
}