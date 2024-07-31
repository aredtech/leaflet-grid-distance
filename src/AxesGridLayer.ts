import * as L from 'leaflet';

interface AxesLayerOptions extends L.GridLayerOptions {
  cells: number;
  color: string;
  axesColor: string;
  axesWidth: number;
  zoom: number;
  showLabel: boolean;
  defaultLabel: {
    color: string;
    size: number;
  };
  center: L.LatLngLiteral;
}

const AxesLayerWithDistance = L.GridLayer.extend({
  options: {
    cells: 5,
    color: '#40404044',
    axesColor: '#ff6754',
    axesWidth: 0.8,
    zoom: 10,
    showLabel: false,
    defaultLabel: {
      color: '#404040',
      size: 13,
    },
    center: { lat: 0, lng: 0 },
  } as AxesLayerOptions,

  onAdd: function (map: L.Map): void {
    L.GridLayer.prototype.onAdd.call(this, map);
    this.setCenter(this.options.center);
  },

  setCenter: function (center: L.LatLngExpression): void {
    this.options.center = L.latLng(center);
    this.redraw();
  },

  createTile: function (coords: L.Coords): SVGElement {
    const svg = this.createParentTile();
    const n = this.options.cells;

    const tileSize = this.getTileSize();
    const nwPoint = coords.scaleBy(tileSize);
    const sePoint = nwPoint.add(tileSize);
    const nw = this._map.unproject(nwPoint, coords.z);
    const se = this._map.unproject(sePoint, coords.z);
    const tileDiagonalDistance = this._map.distance(nw, se);
    const tileEdgeDistance = tileDiagonalDistance / Math.sqrt(2);

    const centerPoint = this._map.project(this.options.center, coords.z);
    const tilePoint = coords.scaleBy(tileSize);
    const relativePoint = tilePoint.subtract(centerPoint);

    const size = 256 / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const tile = this.Rect(i * size, j * size, size, size);
        svg.appendChild(tile);
      }
    }

    svg.setAttributeNS(null, 'id', coords.x.toString());

    if (Math.abs(relativePoint.x) < 128) {
      const weight = this.options.axesWidth;
      const x = 128 - relativePoint.x;
      const line = this.Line(x - weight / 2, 0, x - weight / 2, 256, weight);
      svg.appendChild(line);
    }

    if (Math.abs(relativePoint.y) < 128) {
      const weight = this.options.axesWidth;
      const y = 128 + relativePoint.y;
      const line = this.Line(0, y - weight / 2, 256, y - weight / 2, weight);
      svg.appendChild(line);
    }

    if (this.options.showLabel) {
      const size = this.options.defaultLabel.size;
      const color = this.options.defaultLabel.color;
      const tileNW = this._map.unproject(coords.scaleBy(tileSize), coords.z);
      const baseDistance = this._map.distance(this.options.center, tileNW);

      if (Math.abs(relativePoint.y) < 128) {
        for (let i = 0; i < n; i++) {
          const offsetX = (i - n / 2) * tileEdgeDistance / n;
          const distance = baseDistance + offsetX;
          const text = this.Text(
            this.normalize(distance),
            (i * 256) / n, 128 + relativePoint.y,
            color,
            size - 2,
          );
          svg.appendChild(text);
        }
      }

      if (Math.abs(relativePoint.x) < 128) {
        for (let i = 0; i < n; i++) {
          const offsetY = (n / 2 - i) * tileEdgeDistance / n;
          const distance = baseDistance + offsetY;
          const text = this.Text(
            this.normalize(distance),
            128 - relativePoint.x,
            (i * 256) / n,
            color,
            size - 2,
          );
          svg.appendChild(text);
        }
      }

      if (Math.abs(relativePoint.x) < 128 && Math.abs(relativePoint.y) < 128) {
        const text = this.Text('0,0', 128 - relativePoint.x, 128 + relativePoint.y, color, size);
        svg.appendChild(text);
      }
    }

    return svg;
  },

  normalize(distanceInMeters: number): string {
    let val: number;
    let unit: string;

    if (Math.abs(distanceInMeters) >= 1000) {
      val = distanceInMeters / 1000;
      unit = 'km';
    } else {
      val = distanceInMeters;
      unit = 'm';
    }

    val = Math.round(val * 100) / 100;
    return `${val}${unit}`;
  },

  createParentTile(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(
      'http://www.w3.org/2000/svg',
      'xlink',
      'http://www.w3.org/1999/xlink',
    );
    svg.setAttributeNS('http://www.w3.org/2000/svg', 'height', '256');
    svg.setAttributeNS('http://www.w3.org/2000/svg', 'width', '256');

    const rect = this.Rect(0, 0, 256, 256, 2);
    svg.appendChild(rect);
    return svg;
  },

  Rect(x: number, y: number, width: number, height: number, weight = 0.5): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttributeNS(null, 'height', height.toString());
    rect.setAttributeNS(null, 'width', width.toString());
    rect.setAttributeNS(null, 'x', x.toString());
    rect.setAttributeNS(null, 'y', y.toString());
    rect.setAttributeNS(null, 'fill', 'none');
    rect.setAttributeNS(null, 'stroke', this.options.color);
    rect.setAttributeNS(null, 'stroke-width', weight.toString());
    return rect;
  },

  Line(x1: number, y1: number, x2: number, y2: number, weight = 1): SVGLineElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttributeNS(null, 'x1', x1.toString());
    line.setAttributeNS(null, 'y1', y1.toString());
    line.setAttributeNS(null, 'x2', x2.toString());
    line.setAttributeNS(null, 'y2', y2.toString());
    line.setAttributeNS(null, 'stroke', this.options.axesColor);
    line.setAttributeNS(null, 'stroke-width', weight.toString());
    return line;
  },

  Text(text: string, x: number, y: number, color: string, size: number): SVGTextElement {
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttributeNS(null, 'x', x.toString());
    txt.setAttributeNS(null, 'y', y.toString());
    txt.setAttributeNS(null, 'fill', color);
    txt.setAttributeNS(null, 'font-size', size.toString());
    txt.textContent = text;
    return txt;
  },
});

function AxesLayer(opts: Partial<AxesLayerOptions>): L.GridLayer {
  return new (AxesLayerWithDistance as any)(opts);
}

export { AxesLayer, AxesLayerOptions };
