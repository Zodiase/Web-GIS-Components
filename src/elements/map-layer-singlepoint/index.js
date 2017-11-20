import {
  concat,
  merge,
} from 'lodash.local';
import {
  typeCheck
} from 'type-check';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
} from 'helpers/custom-element-helpers';

import BaseClass from '../map-layer-base';

import {
  elementName,
  defaultDataProjection,
} from './config';

/**
 * Usage:
 * <HTMLMapLayerSinglePoint
 *   // @inheritdoc
 *
 *   // Required.
 *   latitude="{number}"
 *   // Required.
 *   longitude="{number}"
 * ></HTMLMapLayerSinglePoint>
 */
export default class HTMLMapLayerSinglePoint extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'latitude',
    'longitude',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'latitude': commonAttributeToPropertyConverters.number,
    'longitude': commonAttributeToPropertyConverters.number,
  });

  // @override
  static get layerClass () {
    return webGisComponents.ol.layer.Vector;
  }

  // @override
  static get layerSourceClass () {
    return webGisComponents.ol.source.Vector;
  }

  constructor () {
    super();

    this.pointFeature_ = new webGisComponents.ol.Feature({
      geometry: new webGisComponents.ol.geom.Point([0, 0], 'XY'),
    });

    this.updateSource({
      features: [this.pointFeature_],
    });
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {number} latitude
  get latitude () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('latitude'));
  }
  set latitude (val) {
    if (!typeCheck('Number', val)) {
      throw new TypeError('Latitude has to be a number.');
    }

    // Update internal models.
    this.updateCoordinates_(this.longitude, val);

    // Update attributes.
    this.flushPropertyToAttribute('latitude', val, true);
  }

  // @property {number} longitude
  get longitude () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('longitude'));
  }
  set longitude (val) {
    if (!typeCheck('Number', val)) {
      throw new TypeError('Longitude has to be a number.');
    }

    // Update internal models.
    this.updateCoordinates_(val, this.latitude);

    // Update attributes.
    this.flushPropertyToAttribute('longitude', val, true);
  }

  // @override
  get projection () {
    return super.projection;
  }
  set projection (val) {
    super.projection = val;

    this.updateCoordinates_(this.longitude, this.latitude);
  }

  /**
   * Customized public/private methods.
   */

  updateCoordinates_ (lon, lat) {
    if (typeof lat === 'number' && typeof lon === 'number') {
      const coord = [lon, lat];
      const projectedCoord = webGisComponents.ol.proj.transform(coord, defaultDataProjection, this.projection);
      this.pointFeature_.setGeometry(new webGisComponents.ol.geom.Point(projectedCoord, 'XY'));
    } else {
      this.pointFeature_.setGeometry();
    }
  }

} // HTMLMapLayerSinglePoint

customElements.define(elementName, HTMLMapLayerSinglePoint);
