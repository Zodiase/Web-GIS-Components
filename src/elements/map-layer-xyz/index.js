import {
  concat,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
} from 'helpers/custom-element-helpers';

import HTMLMapLayerBase from '../map-layer-base';

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
export default class HTMLMapLayerXYZ extends HTMLMapLayerBase {

  // @override
  static observedAttributes = concat(HTMLMapLayerBase.observedAttributes, [
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
  static attributeNameToPropertyNameMapping = merge({}, HTMLMapLayerBase.attributeNameToPropertyNameMapping, {
    'min-zoom': 'minZoom',
    'max-zoom': 'maxZoom',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, HTMLMapLayerBase.propertyNameToAttributeNameMapping, {
    'minZoom': 'min-zoom',
    'maxZoom': 'max-zoom',
  });

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapLayerBase.attributeToPropertyConverters, {
    'url': commonAttributeToPropertyConverters.string,
    'min-zoom': commonAttributeToPropertyConverters.number,
    'max-zoom': commonAttributeToPropertyConverters.number,
  });

  // @override
  static get layerClass () {
    return this.ol.layer.Tile;
  }

  // @override
  static get layerSourceClass () {
    return this.ol.source.XYZ;
  }

  constructor () {
    super();

    // @type {number}
    this.minZoom_ = defaultMinZoom;
    this.maxZoom_ = defaultMaxZoom;
  }

  /**
   * Getters and Setters (for properties).
   */

  /**
   * This is a reflected property.
   * @property {string|null} url
   */
  get url () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('url'));
  }
  set url (val) {
    const oldValue = this.url;
    const newValue = val === null ? null : String(val);

    // Update internal models.
    this.updateSource({
      url: val
    });

    this.flushPropertyToAttribute('url', newValue, true);

    const event = new CustomEvent('change:url', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'url',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {number} minZoom
   */
  get minZoom () {
    return this.minZoom_;
  }
  set minZoom (val) {
    const oldValue = this.minZoom;
    // `null` turns into 0.
    let newValue = Number(val);
    // TODO: handle when `newValue` is `NaN`.

    if (newValue < 0) {
      newValue = 0;
    }

    if (this.isIdenticalPropertyValue_('minZoom', oldValue, newValue)) {
      return;
    }

    this.updateSource({
      minZoom: newValue,
    });

    const event = new CustomEvent('change:minZoom', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'minZoom',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {number} maxZoom
   */
  get maxZoom () {
    return this.maxZoom_;
  }
  set maxZoom (val) {
    const oldValue = this.maxZoom;
    // `null` turns into 0.
    let newValue = Number(val);
    // TODO: handle when `newValue` is `NaN`.

    if (newValue < 0) {
      newValue = 0;
    }

    if (this.isIdenticalPropertyValue_('maxZoom', oldValue, newValue)) {
      return;
    }

    this.updateSource({
      maxZoom: newValue,
    });

    const event = new CustomEvent('change:maxZoom', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'maxZoom',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * Customized public/private methods.
   */

} // HTMLMapLayerXYZ

webGisComponents.exposeComponentToGlobal(HTMLMapLayerXYZ, elementName);
