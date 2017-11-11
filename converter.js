const turfGrid = require('@turf/square-grid');
const turfHelpers = require('@turf/helpers');
const turfMeta = require('@turf/meta');
const fs = require('fs');

async function init() {
    var polygons;
    try {
        polygons = await loadGrid();
        console.log("Grid loaded!")
    }
    catch (err) {
        console.log("No grid found!");
        console.log("Computing a new grid...");
        await createGrid();
        polygons = await loadGrid();
    }
    turfMeta.featureEach(polygons, (currentFeature, featureIndex) => {
        if (Math.random() >= 0.3)
            currentFeature.properties.sunny = true
    })
    await saveGrid("weatherGrid", polygons);
    console.log("Weather grid saved!")
}


function loadGrid() {
    return new Promise((resolve, reject) => {
        fs.readFile('grid.json', 'utf8', (err, data) => {
            if (err)
                reject(err)
            else
                resolve(JSON.parse(data))
        })
    })
}

function createGrid() {
    return new Promise((resolve, reject) => {
        fs.readFile('italy.json', 'utf8', (err, data) => {
            if (err)
                reject(err)
            else
                resolve(JSON.parse(data))
        })
    })
        .then(data => {
            var poly1 = turfHelpers.polygon(data.features[0].geometry.coordinates)
            var bbox = [4.6582031, 36.0668621, 21.9287109, 49.1529697];
            var cellSide = 5;
            var options = {
                units: 'kilometers',
                mask: poly1
            };
            var squareGrid = turfGrid(bbox, cellSide, options)
            return saveGrid("grid", squareGrid);
        })
}

function saveGrid(fileName, grid) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName + ".json", JSON.stringify(grid), err => {
            if (err)
                reject(err)
            resolve();
        })
    })
}

init();