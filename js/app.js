mapboxgl.accessToken =
    'pk.eyJ1IjoiZGVtYXJwdXNoIiwiYSI6ImNrbjkxc3VjMzBuczEyeXRhdTBhbHJtdHUifQ.oOHYRaVGomZEFRuYsKez_Q';
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10', // style URL
    center: [30.5, 50.5], // starting position [lng, lat]
    zoom: 6 // starting zoom
});

var chapters = {
    'kyiv': {
        duration: 10000,
        bearing: 0,
        center: [30.511662, 50.515717],
        zoom: 8,
        pitch: 20,
        mapStyle: 'dark',
        color: '#8800ff'
    },
    'ankara': {
        duration: 10000,
        center: [32.845948, 39.929565],
        bearing: 0,
        zoom: 8,
        pitch: 0,
        mapStyle: 'light',
        color: '#007cbf'
    },
    'goreme': {
        duration: 10000,
        center: [34.8295, 38.645],
        bearing: 0,
        zoom: 10,
        pitch: 20,
        mapStyle: 'light',
        color: '#00a6ff'
    },
};

var Kyiv = new mapboxgl.Marker({
        color: chapters.kyiv.color
    })
    .setLngLat(chapters.kyiv.center)
    .addTo(map);
var Ankara = new mapboxgl.Marker({
        color: chapters.ankara.color
    })
    .setLngLat(chapters.ankara.center)
    .addTo(map);
var Goreme = new mapboxgl.Marker({
        color: chapters.goreme.color
    })
    .setLngLat(chapters.goreme.center)
    .addTo(map);

// A simple line from origin to destination.
var routeKtoA = {
    'type': 'FeatureCollection',
    'features': [{
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': [chapters.kyiv.center, chapters.ankara.center]
        }
    }]
};

var activeChapterName = 'kyiv';

// On every scroll event, check which element is on screen
window.onscroll = function () {
    var chapterNames = Object.keys(chapters);
    for (var i = 0; i < chapterNames.length; i++) {
        var chapterName = chapterNames[i];
        if (isElementOnScreen(chapterName)) {
            setActiveChapter(chapterName);
            break;
        }
    }
};

map.on('load', () => {
    addSourcesAndLayers();
})

map.on('move', () => {
    if (map) {
        try {
            addSourcesAndLayers();
        } catch (e) {
            console.log(e);

        }
    }
})

function showMapOpacity(state) {
    const map = document.querySelector('#map');

    if (state) {
        map.classList.add('opacity');
    } else {
        map.classList.remove('opacity');
    }
}

function setActiveChapter(chapterName) {
    if (chapterName === activeChapterName) return;
    const styleForCity = chapters[chapterName].mapStyle || 'light';
    const duration = (chapters[chapterName].duration || 6000) / 4;

    map.flyTo(chapters[chapterName]);

    setTimeout(() => {
        showMapOpacity(true);
    }, duration / 2);

    setTimeout(() => {
        showMapOpacity(false);
    }, duration);

    setTimeout(() => {
        map.setStyle('mapbox://styles/mapbox/' + styleForCity + '-v10');
    }, duration);

    document.getElementById(chapterName).setAttribute('class', 'active');
    document.getElementById(activeChapterName).setAttribute('class', '');

    activeChapterName = chapterName;
}

function isElementOnScreen(id) {
    var element = document.getElementById(id);
    var bounds = element.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 0;
}

function addSourcesAndLayers() {
    if (!map.getLayer('routeKtoA')) {
        // Add a source and layer displaying a point which will be animated in a circle.
        map.addSource('routeKtoA', {
            'type': 'geojson',
            lineMetrics: true,
            'data': routeKtoA
        });
        map.addLayer({
            'id': 'routeKtoA',
            'source': 'routeKtoA',
            'type': 'line',
            'paint': {
                'line-width': 4,
                'line-color': '#007cbf',
                'line-gradient': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0,
                    chapters.kyiv.color,
                    1,
                    chapters.ankara.color
                ]
            }
        });
    }

    if (!map.getLayer('routeAtoG')) {
        map.addSource('routeAtoG', {
            'type': 'geojson',
            'data': routeAtoG
        });

        map.addLayer({
            'id': 'routeAtoG',
            'type': 'line',
            'source': 'routeAtoG',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': chapters.goreme.color,
                'line-width': 4
            }
        });
    }
}