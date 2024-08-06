(function(global) {
    const AxesModule = require('../../dist/index');
    global.AxesLayerWithDistance = AxesModule.AxesLayerWithDistance;
})(typeof window !== 'undefined' ? window : this);