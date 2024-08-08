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
declare function AxesLayerWithDistance(opts: Partial<AxesLayerOptions>): L.GridLayer;
export { AxesLayerWithDistance, AxesLayerOptions };
