const turfGrid = require('@turf/square-grid');
const { promisify } = require('util');
const turfHelpers = require('@turf/helpers');
const turfMeta = require('@turf/meta');
const turfUnion = require('@turf/union');
const turfCenter = require('@turf/center-of-mass');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function init() {
    var polygons;
    var unionGrid;
    try {
        polygons = JSON.parse(await (readFile('grid.json')))
        console.log("Grid loaded!")
    }
    catch (err) {
        console.log("No grid found!");
        console.log("Computing a new grid...");
        var mask = JSON.parse(await (readFile('italy.json')))
        var polygons = createGrid(mask);
        await writeFile('grid.json', JSON.stringify(polygons));
    }
    turfMeta.featureEach(polygons, (currentFeature, featureIndex) => {
        if (Math.random() < 0.1)
            currentFeature.properties.sunny = true
        else
            currentFeature.properties.sunny = false

    })
    await writeFile('weatherGrid.json', JSON.stringify(polygons));
    console.log("Weather grid saved!")
    // try {
    //     unionGrid = await loadGrid("unionGrid")
    //     console.log("Union Grid loaded!")
    // }
    // catch (err) {
    //     console.log("No grid found!");
    //     console.log("Computing a new grid...");
    //     unionGrid = await saveGrid("unionGrid", computeUnion(polygons));
    //     console.log("Union grid saved!")
    // }
    console.log("Computing points...")
    await writeFile('centerPoints.json', JSON.stringify(calculatePoints(polygons)));
    console.log("Points computed!")
}

function createGrid(mask) {
    var poly1 = turfHelpers.polygon(mask.features[0].geometry.coordinates)
    var bbox = [4.6582031, 36.0668621, 21.9287109, 49.1529697];
    var cellSide = 10;
    var options = {
        units: 'kilometers',
        mask: poly1
    };
    return turfGrid(bbox, cellSide, options)
}

function computeUnion(weatherGrid) {
    var sunnyPoligons = [];
    turfMeta.featureEach(weatherGrid, (currentFeature, featureIndex) => {
        if (currentFeature.properties.sunny)
            sunnyPoligons.push(currentFeature)
    })
    return turfUnion(...sunnyPoligons);
}

function calculatePoints(grid) {
    var points = [];
    turfMeta.flattenEach(grid, (currentFeature, featureIndex, featureSubIndex) => {
        let point = turfCenter(currentFeature);
        point.properties.sunny = currentFeature.properties.sunny;
        points.push(point)
    })
    return turfHelpers.featureCollection(points);
}

init();