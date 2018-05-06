import {
  concat,
  merge,
} from 'lodash.local';
import {
  typeCheck
} from 'type-check';

import webGisElements from 'namespace';
import {
  commonAttributeToPropertyConverters,
} from 'helpers/custom-element-helpers';

import HTMLMapLayerVector from '../map-layer-vector';

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
export default class HTMLMapLayerSinglePoint extends HTMLMapLayerVector {

  // @override
  static observedAttributes = concat(HTMLMapLayerVector.observedAttributes, [
    'latitude',
    'longitude',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapLayerVector.attributeToPropertyConverters, {
    'latitude': commonAttributeToPropertyConverters.number,
    'longitude': commonAttributeToPropertyConverters.number,
  });

  // @override
  static get layerClass () {
    return this.ol.layer.Vector;
  }

  // @override
  static get layerSourceClass () {
    return this.ol.source.Vector;
  }

  constructor () {
    super();

    this.pointFeature_ = new this.ol.Feature({
      geometry: new this.ol.geom.Point([0, 0], 'XY'),
    });

    this.updateSource({
      features: [this.pointFeature_],
    });
  }

  /**
   * Getters and Setters (for properties).
   */

  /**
   * This is a reflected property.
   * @property {number} latitude
   */
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

  /**
   * This is a reflected property.
   * @property {number} longitude
   */
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
      const projectedCoord = this.ol.proj.transform(coord, defaultDataProjection, this.projection);
      this.pointFeature_.setGeometry(new this.ol.geom.Point(projectedCoord, 'XY'));
    } else {
      this.pointFeature_.setGeometry();
    }
  }

} // HTMLMapLayerSinglePoint

webGisElements.exposeComponentToGlobal(HTMLMapLayerSinglePoint, elementName);
