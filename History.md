## v.NEXT

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

