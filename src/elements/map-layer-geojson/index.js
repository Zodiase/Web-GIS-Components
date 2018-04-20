import {
  concat,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
} from 'helpers/custom-element-helpers';

import HTMLMapLayerVector from '../map-layer-vector';

import {
  elementName,
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
export default class HTMLMapLayerGeoJSON extends HTMLMapLayerVector {

  // @override
  static observedAttributes = concat(HTMLMapLayerVector.observedAttributes, [
    'src-json',
    'src-url',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, HTMLMapLayerVector.attributeNameToPropertyNameMapping, {
    'src-url': 'srcUrl',
    'src-json': 'srcJson',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, HTMLMapLayerVector.propertyNameToAttributeNameMapping, {
    'srcUrl': 'src-url',
    'srcJson': 'src-json',
  });

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapLayerVector.attributeToPropertyConverters, {
    'src-url': commonAttributeToPropertyConverters.string,
    'src-json': commonAttributeToPropertyConverters.string,
  });

  /**
   * Getters and Setters (for properties).
   */

  /**
   * This is a reflected property.
   * @property {string|null} srcUrl
   */
  get srcUrl () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcUrl'));
  }
  set srcUrl (val) {
    const oldValue = this.srcUrl;
    const newValue = val === null ? null : String(val);

    if (newValue === null) {
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
        url: newValue,
        format: new this.ol.format.GeoJSON({
          defaultDataProjection: this.srcProjection,
          featureProjection: this.projection,
        }),
        features: undefined,
      });
    }

    this.flushPropertyToAttribute('srcUrl', newValue, true);

    const event = new CustomEvent('change:srcUrl', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'srcUrl',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is a reflected property.
   * @property {string|null} srcJson
   */
  get srcJson () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('srcJson'));
  }
  set srcJson (val) {
    const oldValue = this.srcJson;
    const newValue = val === null ? null : String(val);

    if (newValue === null) {
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
        features: (new this.ol.format.GeoJSON({
          defaultDataProjection: this.srcProjection,
          featureProjection: this.projection,
        })).readFeatures(JSON.parse(newValue)),
        url: undefined,
        format: undefined,
      });
    }

    this.flushPropertyToAttribute('srcJson', newValue, true);

    const event = new CustomEvent('change:srcJson', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'srcJson',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * Setting an invalid property value silently fails.
   * @property {string|null} srcProjection
   */
  get srcProjection () {
    return this.srcProjection_;
  }
  set srcProjection (val) {
    super.srcProjection = val;

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

webGisComponents.exposeComponentToGlobal(HTMLMapLayerGeoJSON, elementName);
