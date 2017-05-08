/**
 * This lite version doesn't include the web components polyfills but includes openlayers.
 */

import webGisComponents from './namespace';

import ol from 'openlayers';
webGisComponents.setOl(ol);

import './web-gis-components-lite';
