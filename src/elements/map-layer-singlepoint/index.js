import {
  concat,
  merge,
} from 'lodash.local';
import {
  typeCheck
} from 'type-check';

import webGisComponents from 'namespace';

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
    'latitude': (isSet, val) => (
      isSet
      ? parseFloat(val)
      : null
    ),
    'longitude': (isSet, val) => (
      isSet
      ? parseFloat(val)
      : null
    ),
  });

  // @override
  static propertyToAttributeConverters = merge({}, BaseClass.propertyToAttributeConverters, {
    // @param {number} val
    'latitude': (val) => ({
      isSet: true,
      value: String(val),
    }),
    // @param {number} val
    'longitude': (val) => ({
      isSet: true,
      value: String(val),
    }),
  });

  // @override
  static propertyComparators = merge({}, BaseClass.propertyComparators, {
    'latitude': (a, b) => a === b,
    'longitude': (a, b) => a === b,
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
    this.updateCoordinates_(val, this.longitude);

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('latitude'), val);
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
    this.updateCoordinates_(this.latitude, val);

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('longitude'), val);
  }

  // @override
  get projection () {
    return super.projection;
  }
  set projection (val) {
    super.projection = val;

    this.updateCoordinates_(this.latitude, this.longitude);
  }

  /**
   * Customized public/private methods.
   */

  updateCoordinates_ (lat, lon) {
    if (typeof lat === 'number' && typeof lon === 'number') {
      const coord = [lat, lon];
      const projectedCoord = webGisComponents.ol.proj.transform(coord, defaultDataProjection, this.projection);
      this.pointFeature_.setGeometry(new webGisComponents.ol.geom.Point(projectedCoord, 'XY'));
    } else {
      this.pointFeature_.setGeometry();
    }
  }

} // HTMLMapLayerSinglePoint

customElements.define(elementName, HTMLMapLayerSinglePoint);
