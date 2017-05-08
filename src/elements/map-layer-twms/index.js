import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

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
  static observedAttributes = _.concat(BaseClass.observedAttributes, [
    'url',
    'params',
    'server-type',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = _.merge({}, BaseClass.attributeNameToPropertyNameMapping, {
    'url': 'url',
    'params': 'params',
    'server-type': 'serverType',
  });

  // @override
  static propertyNameToAttributeNameMapping = _.merge({}, BaseClass.propertyNameToAttributeNameMapping, {
    'url': 'url',
    'params': 'params',
    'serverType': 'server-type',
  });

  // @override
  static attributeToPropertyConverters = _.merge({}, BaseClass.attributeToPropertyConverters, {
    'url': (isSet, val) => (
      isSet
      ? val
      : null
    ),
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
    'server-type': (isSet, val) => (
      isSet
      ? val
      : null
    ),
  });

  // @override
  static propertyToAttributeConverters = _.merge({}, BaseClass.propertyToAttributeConverters, {
    // @param {string|null} val - String value to be set, null to unset.
    'url': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : val,
    }),
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
//     'server-type'
  });

  // @override
  static propertyComparators = _.merge({}, BaseClass.propertyComparators, {
    'url': (a, b) => a === b,
    'params': (a, b) => _.isEqual(a, b),
    'serverType': (a, b) => a === b,
  });

  // @override
  static layerClass = BaseClass.ol.layer.Tile;

  // @override
  static layerSourceClass = BaseClass.ol.source.TileWMS;

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
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('url'), val);
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
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('params'), val);
  }

  /**
   * Customized public/private methods.
   */

} // HTMLMapLayerTWMS

customElements.define(elementName, HTMLMapLayerTWMS);
