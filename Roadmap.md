# Web GIS Elements Roadmap

- [ ] Vector Feature Styling through DOM.

    It could look like this, with one custom element applying a very specific styling.
    The styles will be applied as the order they appear in the DOM.
    ```HTML
    <map-layer-geojson>
        <!-- Adds a dot on each vertex. -->
        <map-vector-style-vertex-dots></map-vector-style-vertex-dots>
        <!-- Make edges thick. -->
        <map-vector-style-thick-edges></map-vector-style-thick-edges>
    </map-layer-geojson>
    ```

- [ ] Unit test for each layer.
- [ ] Raster post-render processing (e.g. re-coloring).

    It could look like this, with one custom element applying a very specific styling.
    The styles will be applied as the order they appear in the DOM.
    ```HTML
    <map-layer-xyz>
        <!-- Use some coloring scheme. -->
        <map-raster-style-black-and-white></map-raster-style-black-and-white>
        <!-- What should happen if there are multiple coloring schemes? -->
        <map-raster-style-rainbow></map-raster-style-rainbow>
    </map-layer-xyz>
    ```

- [x] (2018-04-14) Basic styling support for vector fill and stroke. [8d4d485437b019b46fa20c539215660563bbacab]
- [x] (2017-04-14) Use Webpack for bundle building. [e24c8f14fa3cd2a74c2f0df5a901845ed8403119]
- [x] (2017-04-14) Include `native-shim` in the bundle. [e24c8f14fa3cd2a74c2f0df5a901845ed8403119]
- [x] (2017-04-19) Support options to enable the default OpenLayers map controls. [a238f821ce79337d1ae1ed84a2e32cff4cdb94cf]
- [x] (2017-04-19) Support options to enable the default OpenLayers map interactions. [d7564fbc255c47521db8213645cac49ebb7fd7bb]
- [x] (2017-05-08) Create basic layer list control.
- [x] (2017-05-08) Generate source map.
