## v.NEXT

- Component constructors are exposed to global so they can be referenced the same way as `HTMLElement` (#6).
- Common interfaces (such as center/extent attribute/property) will always use longitude latitude projection system (#3).

## v0.3.1

- Element constructor names are not mangled any more (#5).

## v0.3.0

- Fixed a bug in one of the demos that only appears in Safari (#12).
- Fixed a bug where `map-control-simple-layer-list` can't recognize a layer group and expand it in production code (#14).
- Using a naive solution to expose ol.Map clicking events to the map view element. So third-parties can capture clicking events and know the coordinates being clicked.
- Added a write-only property for setting view center and zoom with a single extent.
- Updated `openlayers` to `4.4.2`.
- Fixed a bug where `extent` could be overwritten by `center` or `zoom`.
- New element `<map-layer-singlepoint>` for showing a single point on the map.
- New events `load:view` and `unload:view` on the `<map-view>` element to signal when the map is mounted and unmounted.
- Fix the issue where extent is frequently being reset when used in React.
- New elements `<map-layer-vector>` and `<map-interaction-draw>` for drawing / displaying dynamic vector features.
- Vector layers (`<map-layer-vector>`, `<map-layer-geojson>` and `<map-layer-singlepoint>`) can now be somewhat styled with `style` property. See `Vector Layer Demo` for some examples.

## v0.2.1

- Add another build:
    - `web-gis-elements` - Full bundle with all dependencies included.
    - `web-gis-elements-lite` - Lite bundle with no dependency included. User must provide Web Components polyfill and OpenLayers.
    - `web-gis-elements-lite-ol` - Similar to lite bundle but has OpenLayers included.
- Greatly reduce the bundle size (from ~1.3MB to 973KB, unminified).
- Add source map generation.

## v0.2.0

- Replace "babel-cli + browserify" with webpack.
- Include `web components` polyfills in bundle.
- Build another bundle which does not include the polyfills.
- Load openlayers from npm. Update it from v4.0.1 to v4.1.0.
- Basic support for custom control elements.
- Basic support for custom interaction elements.
- Implement naive custom element for adding simple layer list onto the map.

## v0.1.0

- Features:
    - Layer support:
        - GeoJSON layer.
        - Tiled WMS layer.
        - XYZ layer.
        - TMS layer (using XYZ).
    - Layer grouping.
    - Automatic layer projection alignment.

        When a layer is added to a map, its projection will automatically align with the map projection.

