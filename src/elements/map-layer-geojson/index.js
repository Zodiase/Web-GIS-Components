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
 * <HTMLMapLayerGeoJSON
 *   // @inheritdoc
 *
 *   // Required. The url of the geojson data file.
 *   src-url="{string}"
 *   // The json string of the geojson data. This can not co-exist with "src-url".
 *   src-json="{string}"
 *   // Specify the projection the source data coordinates are in. It will only be used when no CRS is available in the data. Default value is "EPSG:4326".
 *   src-projection="{string}"
 * >
 *   <HTMLMapLayerVectorStyle ...></HTMLMapLayerVectorStyle>
 * </HTMLMapLayerGeoJSON>
 */
export default class HTMLMapLayerGeoJSON extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'src-url',
    'src-json',
    'src-projection',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, BaseClass.attributeNameToPropertyNameMapping, {
    'src-url': 'srcUrl',
    'src-json': 'srcJson',
    'src-projection': 'srcProjection',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, BaseClass.propertyNameToAttributeNameMapping, {
    'srcUrl': 'src-url',
    'srcJson': 'src-json',
    'srcProjection': 'src-projection',
  });

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'src-url': (isSet, val) => (
      isSet
      ? val
      : null
    ),
    'src-json': (isSet, val) => (
      isSet
      ? val
      : null
    ),
    'src-projection': (isSet, val) => (
      isSet
      ? val
      : null
    ),
  });

  // @override
  static propertyToAttributeConverters = merge({}, BaseClass.propertyToAttributeConverters, {
    // @param {string|null} val - String value to be set, null to unset.
    'src-url': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : val,
    }),
    // @param {string|null} val - String value to be set, null to unset.
    'src-json': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : val,
    }),
    // @param {string|null} val - String value to be set, null to unset.
    'src-projection': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : val,
    }),
  });

  // @override
  static propertyComparators = merge({}, BaseClass.propertyComparators, {
    'srcUrl': (a, b) => a === b,
    'srcJson': (a, b) => a === b,
    'srcProjection': (a, b) => a === b,
  });

  // @override
  static get layerClass () {
    return webGisComponents.ol.layer.Vector;
  }

  // @override
  static get layerSourceClass () {
    return webGisComponents.ol.source.Vector;
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {string|null} srcUrl
  get srcUrl () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcUrl'));
  }
  set srcUrl (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('GeoJSON layer source data url has to be a string.');
    }

    if (val === null) {
      // Update internal models.
      this.updateSource({
        url: undefined,
        format: undefined,
      });
    } else {
      // Cannot have `src-json` set.
      if (this.srcJson !== null) {
        throw new TypeError('GeoJSON layer can not have both source data JSON and source data url.');
      }

      // Update internal models.
      this.updateSource({
        url: val,
        format: new webGisComponents.ol.format.GeoJSON({
          defaultDataProjection: this.srcProjection,
          featureProjection: this.projection,
        }),
        features: undefined,
      });
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('srcUrl'), val);
  }

  // @property {string|null} srcJson
  get srcJson () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcJson'));
  }
  set srcJson (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('GeoJSON layer source data JSON has to be a string.');
    }

    if (val === null) {
      // Update internal models.
      this.updateSource({
        features: undefined,
      });
    } else {
      // Cannot have `src-url` set.
      if (this.srcUrl !== null) {
        throw new TypeError('GeoJSON layer can not have both source data JSON and source data url.');
      }

      // Update internal models.
      this.updateSource({
        features: (new webGisComponents.ol.format.GeoJSON({
          defaultDataProjection: this.srcProjection,
          featureProjection: this.projection,
        })).readFeatures(JSON.parse(val)),
        url: undefined,
        format: undefined,
      });
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('srcJson'), val);
  }

  // @property {string|null} srcProjection
  get srcProjection () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcProjection'));
    return propValFromAttr === null ? defaultDataProjection : propValFromAttr;
  }
  set srcProjection (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('GeoJSON layer source data projection has to be a string.');
    }

    if (val !== null && !this.constructor.isValidProjection(val)) {
      throw new TypeError('Invalid projection.');
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('srcProjection'), val);

    if (this.srcUrl) {
      this.logWarn_('Resetting src-url.');
      const swap = this.srcUrl;
      this.srcUrl = null;
      this.srcUrl = swap;
    }
    if (this.srcJson) {
      this.logWarn_('Resetting src-json.');
      const swap = this.srcJson;
      this.srcJson = null;
      this.srcJson = swap;
    }
  }

  // @override
  get projection () {
    return super.projection;
  }
  set projection (val) {
    super.projection = val;

    if (this.srcUrl) {
      this.logWarn_('Resetting src-url.');
      const swap = this.srcUrl;
      this.srcUrl = null;
      this.srcUrl = swap;
    }
    if (this.srcJson) {
      this.logWarn_('Resetting src-json.');
      const swap = this.srcJson;
      this.srcJson = null;
      this.srcJson = swap;
    }
  }

  /**
   * Customized public/private methods.
   */

} // HTMLMapLayerGeoJSON

customElements.define(elementName, HTMLMapLayerGeoJSON);
