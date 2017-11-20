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
  defaultMinZoom,
  defaultMaxZoom,
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapLayerXYZ
 *   // @inheritdoc
 *
 *   // The url template of the xyz source.
 *   url="{string}"
 *   // The minimum zoom level the source supports.
 *   min-zoom="{number}"
 *   // The maximum zoom level the source supports.
 *   max-zoom="{number}"
 * ></HTMLMapLayerXYZ>
 */
export default class HTMLMapLayerXYZ extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    // Url template of the layer source.
    // Required.
    // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.XYZ.html}
    'url',
    // Minimum zoom level.
    // Optional.
    // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.XYZ.html}
    'min-zoom',
    // Maximum zoom level.
    // Optional.
    // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.XYZ.html}
    'max-zoom',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, BaseClass.attributeNameToPropertyNameMapping, {
    'min-zoom': 'minZoom',
    'max-zoom': 'maxZoom',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, BaseClass.propertyNameToAttributeNameMapping, {
    'minZoom': 'min-zoom',
    'maxZoom': 'max-zoom',
  });

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'url': commonAttributeToPropertyConverters.string,
    'min-zoom': commonAttributeToPropertyConverters.number,
    'max-zoom': commonAttributeToPropertyConverters.number,
  });

  // @override
  static get layerClass () {
    return webGisComponents.ol.layer.Tile;
  }

  // @override
  static get layerSourceClass () {
    return webGisComponents.ol.source.XYZ;
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {string|null} url
  get url () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('url'));
  }
  set url (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Tiled WMS layer url has to be a string.');
    }

    // Update internal models.
    this.updateSource({
      url: val
    });

    // Update attributes.
    this.flushPropertyToAttribute('url', val, true);
  }

  // @property {number} minZoom
  get minZoom () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('minZoom'));
    return propValFromAttr === null ? defaultMinZoom : propValFromAttr;
  }
  set minZoom (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer minimum zoom has to be a number.');
    }

    if (val < 0) {
      throw new RangeError('Layer minimum zoom can not be lower than 0.');
    }

    // Update internal models.
    this.updateSource({
      minZoom: val
    });

    // Update attributes.
    this.flushPropertyToAttribute('minZoom', val, true);
  }

  // @property {number} maxZoom
  get maxZoom () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('maxZoom'));
    return propValFromAttr === null ? defaultMaxZoom : propValFromAttr;
  }
  set maxZoom (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer maximum zoom has to be a number.');
    }

    if (val < 0) {
      throw new RangeError('Layer maximum zoom can not be lower than 0.');
    }

    // Update internal models.
    this.updateSource({
      maxZoom: val
    });

    // Update attributes.
    this.flushPropertyToAttribute('maxZoom', val, true);
  }

  /**
   * Customized public/private methods.
   */

} // HTMLMapLayerXYZ

customElements.define(elementName, HTMLMapLayerXYZ);
