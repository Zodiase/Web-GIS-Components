/**
 * This lite version doesn't include the web components polyfills but includes openlayers.
 */

import webGisElements from './namespace';

import ol from 'openlayers';
webGisElements.setOl(ol);

import './web-gis-elements-lite';
