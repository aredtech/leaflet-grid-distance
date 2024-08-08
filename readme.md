Copy# AxesLayerWithDistance  [![npm version](https://badge.fury.io/js/axes-layer-with-distance.svg)](https://badge.fury.io/js/axes-layer-with-distance) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**AxesLayerWithDistance** is a custom Leaflet grid layer that displays a customizable grid with labeled axes on a Leaflet map. This library allows you to visualize distance scales directly on your map tiles, enhancing the map's usability and interactivity for educational, scientific, or navigational purposes.

## Features

- **Customizable Grid**: Configure the number of cells, color, and size of grid lines.
- **Axes Labels**: Show distance labels on the axes in meters or kilometers.
- **Dynamic Centering**: Set and update the center of the grid dynamically.
- **Snap Axes to Grid**: Option to snap the axes to the nearest grid line.
- **Canvas Rendering**: Utilizes HTML5 Canvas for efficient rendering.

## Demo

### Running Demo Link: [Demo](https://aredtech.github.io/leaflet-grid-distance/)

![Demo Screenshot](./src/screenshot/image.png)

## Installation

Install the package via npm:

```bash
npm install leaflet-grid-distance

```

## Usage
First, import the library and Leaflet into your project:

```
import * as L from 'leaflet';
import { AxesLayerWithDistance, AxesLayerOptions } from 'axes-layer-with-distance';

```

## Create a Map and Add the Layer

Here is a simple example of how to create a Leaflet map and add the `AxesLayerWithDistance`:

```
// Create a map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer (e.g., OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Create an AxesLayerWithDistance with options
const axesLayerWithDistance = AxesLayerWithDistance({
  primaryColor: '#ff0000',
  secondaryColor: '#999999',
  textColor: '#000000',
  fontSize: 12,
  kmThreshold: 13,
});

// Add the AxesLayerWithDistance to the map
axesLayerWithDistance.addTo(map);

```

## Options
You can customize the AxesLayerWithDistance using the following options:

- **primaryColor**: Color of the main axes lines. Default is '#ff0000'.
- **secondaryColor**: Color of the grid lines. Default is '#999999'.
- **textColor**: Color of the text labels. Default is '#000000'.
- **fontSize**: Font size of the text labels. Default is 12.
- **kmThreshold**: Zoom level threshold for switching between km and m units. Default is 13.
- **origin**: Set the origin point of the grid layer.
- **snapAxesToGrid**: Snap the axes to the nearest grid line. Default is false.

## Methods
- The AxesLayerWithDistance extends Leaflet's GridLayer and inherits all its methods.
- ```changeOptions(options: Partial<AxesLayerOptions>)```: Update the options of the AxesLayerWithDistance and redraw the layer.

## Contributing
We welcome contributions to improve this library. Please fork the repository, create a branch, and submit a pull request with your changes.

## License
This project is licensed under the MIT [License](https://opensource.org/license/mit). See the LICENSE file for details.


## Questions and Support
For any questions or support requests, please open an issue on the GitHub repository or contact me directly at techyared.main@gmail.com.