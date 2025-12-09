
mapboxgl.accessToken = 'pk.eyJ1Ijoia2xhdXNtYXlyIiwiYSI6ImNsM20xZWFxejAwNmkza29mcHptN243aTYifQ.lfLe-OcdZ89adHFcD7r9tQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/klausmayr/cmiulm2tn003j01s7brgd7kgl',
    center: [-78.9, 36.05],
    zoom: 10
});

map.on('load', () => {
    // map.addSource('udo-tileset', {
    //     type: 'vector',
    //     url: 'mapbox://klausmayr.3z2anopq'
    // });

    // map.addLayer({
    //     id: 'udo-fill',
    //     type: 'fill',
    //     source: 'udo-tileset',
    //     'source-layer': 'newUDO2', 
    //     paint: {
    //         'fill-color': [
    //             'match',
    //             ['get', 'NewZoning'],
    //             'R-D', 'hsl(244, 99%, 73%)',
    //             ['RX-3', 'RX-5', 'IX', 'RX-8'], 'hsl(17, 67%, 66%)',
    //             ['CX-8', 'CX-3', 'CX-5', 'CX-20'], 'hsl(114, 100%, 75%)',
    //             'hsla(0, 0%, 70%, 0.70)'
    //         ],
    //         'fill-opacity': 0.1
    //     }
    // });
    map.addSource('local-data', {
        type: 'geojson',
        data: 'compass_economy_zones_ads2.geojson'
    });

    // map.addLayer({
    //     id: 'local-data-fill',
    //     type: 'fill',
    //     source: 'local-data',
    //     paint: {
    //         'fill-opacity': 0,
    //         'fill-color': 'rgba(0,0,0,0)', 
    //     }
    // });

    // // Add outline too (optional)
    // map.addLayer({
    //     id: 'local-data-outline',
    //     type: 'line',
    //     source: 'local-data',
    //     paint: {
    //         'line-width': 0.2
    //     }
    // });

    // map.addLayer({
    //     id: 'local-income-fill',
    //     type: 'fill',
    //     source: 'local-data',
    //     paint: {
    //         'fill-color': [
    //             'step',
    //             ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]],
            
    //             '#fee5d9', 40000,   // under 40k
    //             '#fcae91', 60000,   // 40–60k
    //             '#fb6a4a', 80000,   // 60–80k
    //             '#de2d26', 100000,  // 80–100k
    //             '#a50f15'           // 100k+
    //         ],
    //         'fill-opacity': 0.8
    //     }
    map.addLayer({
        id: 'income-40',
        type: 'fill',
        source: 'local-data',
        layout: { visibility: 'none' },
        filter: ['<', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 40000],
        paint: { 'fill-color': '#e7f0fa', 'fill-opacity': 0.8 }
    });
    
    map.addLayer({
        id: 'income-40-60',
        type: 'fill',
        source: 'local-data',
        layout: { visibility: 'none' },
        filter: [
            'all',
            ['>=', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 40000],
            ['<', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 60000]
        ],
        paint: { 'fill-color': '#c4dbf2', 'fill-opacity': 0.8 }
    });
    
    map.addLayer({
        id: 'income-60-80',
        type: 'fill',
        source: 'local-data',
        layout: { visibility: 'none' },   // ⬅ starts hidden
        filter: [
            'all',
            ['>=', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 60000],
            ['<', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 80000]
        ],
        paint: { 'fill-color': '#92c2e7', 'fill-opacity': 0.8 }
    });
    
    map.addLayer({
        id: 'income-80-100',
        type: 'fill',
        source: 'local-data',
        layout: { visibility: 'none' },
        filter: [
            'all',
            ['>=', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 80000],
            ['<', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 100000]
        ],
        paint: { 'fill-color': '#4d9ad1', 'fill-opacity': 0.8 }
    });
    
    map.addLayer({
        id: 'income-100',
        type: 'fill',
        source: 'local-data',
        layout: { visibility: 'none' }, 
        filter: ['>=', ['to-number', ['slice', ['get', 'Median.Household.Income..2023'], 1]], 100000],
        paint: { 'fill-color': '#1c6cb1', 'fill-opacity': 0.8 }
    });
    
document.getElementById('toggle-local').addEventListener('change', (e) => {
    const visible = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('local-income-fill', 'visibility', visible);
    // map.setLayoutProperty('local-data-outline', 'visibility', visible);
});
});

document.querySelectorAll('.income-swatch').forEach(item => {
    item.addEventListener('click', () => {
        const layer = item.dataset.layer;
        const current = map.getLayoutProperty(layer, 'visibility');

        // Toggle layer visibility
        map.setLayoutProperty(layer, 'visibility',
            current === 'none' ? 'visible' : 'none'
        );

        // Optional: Fade swatch when disabled
        item.style.opacity = current === 'none' ? 1 : 0.4;
    });
});
const incomeLayers = [
    'income-40',
    'income-40-60',
    'income-60-80',
    'income-80-100',
    'income-100'
];

const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

incomeLayers.forEach(layerID => {

    // Show popup on hover
    map.on('mousemove', layerID, (e) => {
        const props = e.features[0].properties;

        const income = props["Median.Household.Income..2023"];

        const entries = Object.entries(props)
            .filter(([key, value]) =>
                key !== "Median.Household.Income..2023" &&
                key !== "Geography.Id" &&
                key !== "id_min" &&
                typeof value === "number"
        );

        const sorted = entries.sort((a, b) => b[1] - a[1]);
        const top3 = sorted.slice(0, 6);

        const top3Html = top3
            .map(([key, value]) => `<li>${key}: ${(value * 100).toFixed(1)}%</li>`)
            .join("");

        const html = `
            <strong>Median Income:</strong> ${income}<br><br>
            <strong>Top Residential Land Classes:</strong>
            <ul>${top3Html}</ul>
        `;

        popup
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
    });

    // Remove popup on mouse leave
    map.on('mouseleave', layerID, () => {
        popup.remove();
    });
});

const infoButton = document.getElementById('info-button');
const infoPanel = document.getElementById('info-panel');
const infoClose = document.getElementById('info-close');

infoButton.addEventListener('click', () => {
  infoPanel.classList.add('active');
});

infoClose.addEventListener('click', () => {
  infoPanel.classList.remove('active');
});

