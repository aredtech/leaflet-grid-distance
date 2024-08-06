import * as L from 'leaflet';

interface AxesLayerOptions extends L.GridLayerOptions {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontSize: number;
  kmThreshold: number;
  origin?: L.LatLngExpression;
  snapAxesToGrid?: boolean;
}

const AxesLayerWithDistanceClass = L.GridLayer.extend({
  options: {
    tileSize: 256,
    primaryColor: '#ff0000',
    secondaryColor: '#999999',
    textColor: '#000000',
    fontSize: 12,
    kmThreshold: 13,
    snapAxesToGrid: false
  },

  initialize: function (options: Partial<AxesLayerOptions>) {
    (L as any).setOptions(this, options);
    (L.GridLayer.prototype as any).initialize.call(this, options);
    this._center = this.options.origin ? this.options.origin : null;
  },

  onAdd: function (map: L.Map) {
    L.GridLayer.prototype.onAdd.call(this, map);
    this._center = this.options.origin ? this.options.origin : map.getCenter();
    map.setView(this._center);
    map.on('move', this._onMove, this);
  },

  onRemove: function (map: L.Map) {
    map.off('move', this._onMove, this);
    L.GridLayer.prototype.onRemove.call(this, map);
  },

  // eslint-disable-next-line unused-imports/no-unused-vars
  _onMove: function (e: L.LeafletEvent) {
    this._center = this.options.origin ? this.options.origin : this._map.getCenter();
    this.redraw();
  },

  createTile: function (coords: L.Coords, done: (error: Error | null, tile: HTMLElement) => void): HTMLElement {
    const tile = L.DomUtil.create('canvas', 'leaflet-tile') as HTMLCanvasElement;
    const size = this.getTileSize();
    tile.width = size.x;
    tile.height = size.y;
    const ctx = tile.getContext('2d');

    // Ensure _center is defined before drawing
    if (!this._center && this._map) {
      this._center = this.options.origin ? this.options.origin : this._map.getCenter();
    }

    if (this._center) {
      this._drawGrid(ctx, coords, size);
    }

    setTimeout(() => {
      done(null, tile);
    }, 0);

    return tile;
  },

  _drawGrid: function (ctx: CanvasRenderingContext2D, coords: L.Coords, size: L.Point) {
    const zoom = this._map.getZoom();
    const centerPoint = this._map.project(this._center, zoom);
    const tilePoint = coords.scaleBy(size);

    // Draw grid lines
    ctx.strokeStyle = this.options.secondaryColor;
    ctx.lineWidth = 1;

    const gridSize = size.x / 4; // Since we're drawing 4x4 grid

    for (let i = 0; i <= size.x; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size.x, i);
      ctx.stroke();
    }

    // Calculate axis positions
    let xAxisY = centerPoint.y - tilePoint.y;
    let yAxisX = centerPoint.x - tilePoint.x;

    // Snap axes to nearest grid line
    if(this.options.snapAxesToGrid){
      xAxisY = Math.round(xAxisY / gridSize) * gridSize;
      yAxisX = Math.round(yAxisX / gridSize) * gridSize;
    }

    // Draw main axes
    ctx.strokeStyle = this.options.primaryColor;
    ctx.lineWidth = 2;

    // Draw X-axis (horizontal line)
    if (xAxisY >= 0 && xAxisY <= size.y) {
      ctx.beginPath();
      ctx.moveTo(0, xAxisY);
      ctx.lineTo(size.x, xAxisY);
      ctx.stroke();
    }

    // Draw Y-axis (vertical line)
    if (yAxisX >= 0 && yAxisX <= size.x) {
      ctx.beginPath();
      ctx.moveTo(yAxisX, 0);
      ctx.lineTo(yAxisX, size.y);
      ctx.stroke();
    }

    // Draw distance labels
    this._drawDistanceLabels(ctx, coords, size, centerPoint, zoom);
  },

  _drawDistanceLabels: function (
    ctx: CanvasRenderingContext2D,
    coords: L.Coords,
    size: L.Point,
    centerPoint: L.Point,
    zoom: number,
  ) {
    const tileSize = this.getTileSize();

    ctx.fillStyle = this.options.textColor;
    ctx.font = `${this.options.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tilePoint = coords.scaleBy(tileSize);
    const xAxisY = centerPoint.y - tilePoint.y;
    const yAxisX = centerPoint.x - tilePoint.x;

    // Calculate the distance represented by one tile
    const tileCenterPoint = tilePoint.add([tileSize.x / 2, tileSize.y / 2]);
    let metersPerPixel;

    try {
      const tileCenterLatLng = this._map.unproject(tileCenterPoint, coords.z);
      const tileEdgeLatLng = this._map.unproject(tileCenterPoint.add([tileSize.x / 2, 0]), coords.z);
      const tileWidthMeters = tileCenterLatLng.distanceTo(tileEdgeLatLng) * 2;
      metersPerPixel = tileWidthMeters / tileSize.x;
    } catch (error) {
      console.warn('Error calculating distance:', error);
      return; // Exit the function if we can't calculate the distance
    }

    // Determine unit based on the zoom level
    const useKilometers = zoom <= this.options.kmThreshold;
    const unit = useKilometers ? 'km' : 'm';
    const unitMultiplier = useKilometers ? 0.001 : 1;

    // Function to format distance
    const formatDistance = (distanceMeters: number) => {
      const distance = distanceMeters * unitMultiplier;
      return useKilometers ? distance.toFixed(2) : Math.round(distance);
    };

    // X-axis labels
    if (xAxisY >= 0 && xAxisY <= size.y) {
      for (let i = 0; i <= size.x; i += size.x / 4) {
        const pixelDistance = Math.abs(i - yAxisX);
        const distanceMeters = pixelDistance * metersPerPixel;
        const formattedDistance = formatDistance(distanceMeters);
        ctx.fillText(`${formattedDistance}${unit}`, i, xAxisY + 20);
      }
    }

    // Y-axis labels
    if (yAxisX >= 0 && yAxisX <= size.x) {
      for (let i = 0; i <= size.y; i += size.y / 4) {
        const pixelDistance = Math.abs(i - xAxisY);
        const distanceMeters = pixelDistance * metersPerPixel;
        const formattedDistance = formatDistance(distanceMeters);
        ctx.fillText(`${formattedDistance}${unit}`, yAxisX + 20, i);
      }
    }
  },

  _getScale: function (zoom: number) {
    const centerLatLng = this._center || this.options.origin ? this.options.origin : this._map.getCenter();;
    const pointC = this._map.project(centerLatLng, zoom);
    const pointX = L.point(pointC.x + this.options.tileSize / 2, pointC.y);
    const latLngC = this._map.unproject(pointC, zoom);
    const latLngX = this._map.unproject(pointX, zoom);

    return latLngC.distanceTo(latLngX) / (this.options.tileSize / 2);
  },
});

function AxesLayerWithDistance(opts: Partial<AxesLayerOptions>): L.GridLayer {
  return new (AxesLayerWithDistanceClass as any)(opts);
}

export { AxesLayerWithDistance, AxesLayerOptions };
