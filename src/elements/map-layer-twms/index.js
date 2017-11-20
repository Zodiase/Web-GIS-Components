import {
  concat,
  isEqual,
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
} from './config';

/**
 * Usage:
 * <HTMLMapLayerTWMS
 *   // @inheritdoc
 *
 *   // Required. The url of the wms source.
 *   url="{string}"
 *   // WMS request parameters formatted as a query string: Name1=Value1&Name2=Value2 (names and values require escaping).
 *   // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
 *   params="{string}"
 *   // Not currently used.
 *   // @see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
 *   server-type="{string}"
 * ></HTMLMapLayerTWMS>
 */
export default class HTMLMapLayerTWMS extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'url',
    'params',
    'server-type',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, BaseClass.attributeNameToPropertyNameMapping, {
    'server-type': 'serverType',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, BaseClass.propertyNameToAttributeNameMapping, {
    'serverType': 'server-type',
  });

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'url': commonAttributeToPropertyConverters.string,
    'params': (isSet, val) => (
      isSet
      ? val.split('&')
           .map((pairStr) => pairStr.split('=').map((x) => decodeURIComponent(x)))
           .reduce((acc, [key, value]) => ({
             ...acc,
             [key]: value
           }), {})
      : {}
    ),
    'server-type': commonAttributeToPropertyConverters.string,
  });

  // @override
  static propertyToAttributeConverters = merge({}, BaseClass.propertyToAttributeConverters, {
    'params': (val) => ({
      isSet: !(val === null),
      value: (val === null)
             ? ''
             : Object.keys(val)
                     .map((key) => [key, val[key]].map((x) => encodeURIComponent(x))
                                                  .join('='))
                     .join('&'),
    }),
    //@see {@link http://openlayers.org/en/latest/apidoc/ol.source.TileWMS.html}
    // 'server-type'
  });

  // @override
  static propertyComparators = merge({}, BaseClass.propertyComparators, {
    'params': (a, b) => isEqual(a, b),
  });

  // @override
  static get layerClass () {
    return webGisComponents.ol.layer.Tile;
  }

  // @override
  static get layerSourceClass () {
    return webGisComponents.ol.source.TileWMS;
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

  // @property {Object|null} params
  get params () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('params'));
  }
  set params (val) {
    if (!typeCheck('Object | Null', val)) {
      throw new TypeError('Tiled WMS layer params has to be an object.');
    }

    // Update internal models.
    this.updateSource({
      params: val
    });

    // Update attributes.
    this.flushPropertyToAttribute('params', val, true);
  }

  /**
   * Customized public/private methods.
   */

} // HTMLMapLayerTWMS

customElements.define(elementName, HTMLMapLayerTWMS);
