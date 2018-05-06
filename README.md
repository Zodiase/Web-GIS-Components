# Web GIS Elements

This project uses [Web Components Technology](https://developer.mozilla.org/en-US/docs/Web/Web_Components) to build a suite of reusable components that can be used as the fundation of Web GIS applications.

See `Developer.md` for implementation decisions and details.

See `Roadmap.md` for upcoming features.

## Demo

Checkout the online version at: [zodiase.github.io/Web-GIS-Elements/demo](https://zodiase.github.io/Web-GIS-Elements/demo/)

The `docs/demo` directory contains demo pages for various example usages. Run `npm run demo` to launch the demo site at `localhost:5000`.

But before the demo site is usable, the project distribution files have to be built first.

## Building

Run `npm install && npm run build` to build the distribution files to `dist` directory.

## Dependencies

This library requires browser support for [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements) and [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM).

It also requires `native-shim` [available here](https://github.com/webcomponents/custom-elements/blob/master/src/native-shim.js) to allow use of Custom Elements in transpiled ES5 code.

The polyfills are already bundled in `web-gis-elements.js`. Use `web-gis-elements-lite.js` if the polyfills are provided separately.

## Versions

This project follows [Semantic Versioning](http://semver.org/). See `History.md` for release changes.
