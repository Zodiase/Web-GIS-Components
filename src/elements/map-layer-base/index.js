import {
  clone,
  concat,
  merge,
} from 'lodash.local';
import {
  typeCheck
} from 'type-check';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
  createBooleanPropertyToAttributeConverter,
  commonPropertyToAttributeConverters,
  commonPropertyComparators,
} from 'helpers/custom-element-helpers';

import HTMLMapBaseClass from '../base';

import {
  defaultLayerProjection,
} from './config';

/**
 * Usage:
 * <HTMLMapLayerBase
 *   // Unique name for the layer.
 *   name="{string}"
 *   // Opacity of the layer. Default is "1".
 *   opacity="{number}"
 *   // Extent of the layer. This restricts the region where data will be loaded. Default is unrestricted.
 *   extent="{number}, {number}, {number}, {number}"
 *   // Visibility of the layer. Default is false (visible).
 *   invisible
 *   // The minimum resolution (inclusive) at which this layer will be visible.
 *   min-resolution="{number}"
 *   // The maximum resolution (exclusive) below which this layer will be visible.
 *   max-resolution="{number}"
 *   // The current projection used by this layer. This should match the map view projection. Default value is "EPSG:3857".
 *   projection="{string}"
 * ></HTMLMapLayerBase>
 */
export default class HTMLMapLayerBase extends HTMLMapBaseClass {

  // @override
  static observedAttributes = concat(HTMLMapBaseClass.observedAttributes, [
    'name',
    'opacity',
    'extent',
    'invisible',
    'min-resolution',
    'max-resolution',
    'projection',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, HTMLMapBaseClass.attributeNameToPropertyNameMapping, {
    'min-resolution': 'minResolution',
    'max-resolution': 'maxResolution',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, HTMLMapBaseClass.propertyNameToAttributeNameMapping, {
    'minResolution': 'min-resolution',
    'maxResolution': 'max-resolution',
  });

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapBaseClass.attributeToPropertyConverters, {
    'name': commonAttributeToPropertyConverters.string,
    'opacity': commonAttributeToPropertyConverters.number,
    'extent': commonAttributeToPropertyConverters.array_number,
    'invisible': commonAttributeToPropertyConverters.bool,
    'min-resolution': commonAttributeToPropertyConverters.number,
    'max-resolution': commonAttributeToPropertyConverters.number,
    'projection': commonAttributeToPropertyConverters.string,
  });

  // @override
  static propertyToAttributeConverters = merge({}, HTMLMapBaseClass.propertyToAttributeConverters, {
    'extent': commonPropertyToAttributeConverters.array_simple,
    'invisible': createBooleanPropertyToAttributeConverter('invisible'),
  });

  // @override
  static propertyComparators = merge({}, HTMLMapBaseClass.propertyComparators, {
    'extent': commonPropertyComparators.array,
  });

  /**
   * The class that should be used for the layer instance.
   * Child classes should override this.
   * @property {ol.layer.Base}
   * @readonly
   * @static
   */
  static get layerClass () {
    return webGisComponents.ol.layer.Base;
  }

  /**
   * The class that should be used for the layer source instance.
   * Child classes should override this.
   * @property {ol.source.Source}
   * @readonly
   * @static
   */
  static get layerSourceClass () {
    return webGisComponents.ol.source.Source;
  }

  constructor () {
    super();

    // Used in constructor of ol.source.Source.
    this.olSourceOptions_ = {};

    // @type {ol.layer.Base}
    this.olLayer_ = new this.constructor.layerClass({});

    // @type {string}
    this.projection_ = defaultLayerProjection;
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {ol.layer.Base} layer
  // @readonly
  get layer () {
    return this.olLayer_;
  }

  /**
   * This is a reflected property.
   * @property {string|null} name
   */
  get name () {
    return this.olLayer_.get('name');
  }
  set name (val) {
    const oldValue = this.name;
    const newValue = val === null ? null : String(val);

    if (this.isIdenticalPropertyValue_('name', oldValue, newValue)) {
      return;
    }

    this.olLayer_.set('name', newValue);

    const event = new CustomEvent('change:name', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'name',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {number} opacity
   */
  get opacity () {
    return this.olLayer_.getOpacity();
  }
  set opacity (val) {
    const oldValue = this.opacity;
    // `null` turns into 0.
    const newValue = Number(val);
    // TODO: handle when `newValue` is `NaN`.

    if (this.isIdenticalPropertyValue_('opacity', oldValue, newValue)) {
      return;
    }

    this.olLayer_.setOpacity(newValue);

    const event = new CustomEvent('change:opacity', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'opacity',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {Array.<number>|null} extent
   */
  get extent () {
    return this.olLayer_.getExtent() || null;
  }
  set extent (val) {
    if (!typeCheck('(Number, Number, Number, Number) | Null', val)) {
      throw new TypeError('Layer extent has to be an array of 4 numbers.');
    }

    const oldValue = this.extent;
    const newValue = val;

    if (this.isIdenticalPropertyValue_('extent', oldValue, newValue)) {
      return;
    }

    this.olLayer_.setExtent(val);

    const event = new CustomEvent('change:extent', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'extent',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is a reflected property.
   * @property {boolean} invisible
   */
  get invisible () {
    return !this.olLayer_.getVisible();
  }
  set invisible (val) {
    const oldValue = this.invisible;
    const newValue = val === null ? null : Boolean(val);

    if (this.isIdenticalPropertyValue_('invisible', oldValue, newValue)) {
      return;
    }

    this.olLayer_.setVisible(!newValue);

    this.flushPropertyToAttribute('invisible', newValue, true);

    const event = new CustomEvent('change:invisible', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'invisible',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {number} minResolution
   */
  get minResolution () {
    return this.olLayer_.getMinResolution();
  }
  set minResolution (val) {
    const oldValue = this.minResolution;
    // `null` turns into 0.
    const newValue = Number(val);
    // TODO: handle when `newValue` is `NaN`.

    if (this.isIdenticalPropertyValue_('minResolution', oldValue, newValue)) {
      return;
    }

    this.olLayer_.setMinResolution(newValue);

    const event = new CustomEvent('change:minResolution', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'minResolution',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {number} maxResolution
   */
  get maxResolution () {
    return this.olLayer_.getMaxResolution();
  }
  set maxResolution (val) {
    const oldValue = this.maxResolution;
    // `null` turns into 0.
    const newValue = Number(val);
    // TODO: handle when `newValue` is `NaN`.

    if (this.isIdenticalPropertyValue_('maxResolution', oldValue, newValue)) {
      return;
    }

    this.olLayer_.setMaxResolution(newValue);

    const event = new CustomEvent('change:maxResolution', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'maxResolution',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * Setting an invalid property value silently fails.
   * @property {string|null} projection
   */
  get projection () {
    return this.projection_;
  }
  set projection (val) {
    const oldValue = this.projection;
    let newValue = val === null ? null : String(val);

    if (newValue === null || !this.constructor.isValidProjection(newValue)) {
      newValue = defaultLayerProjection;
    }

    if (this.isIdenticalPropertyValue_('projection', oldValue, newValue)) {
      return;
    }

    this.projection_ = newValue;

    const event = new CustomEvent('change:projection', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'projection',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * Customized public/private methods.
   */

  /**
   * Use the options set in `this.olSourceOptions_` to create a new layer source and use that in the layer.
   * Since this creates a new source thus loosing all the cached data in the old one, don't use this for minor changes.
   * Pass in `undefined` (or `void 0`) as value to delete a field.
   * @param {Object} options
   * @returns {ol.source.Source}
   */
  updateSource (options) {
    if (this.olLayer_ === null) {
      throw new TypeError('Should not call updateSource before initializing the layer.');
    }

    const olSourceOptions = clone(this.olSourceOptions_);
    Object.keys(options).forEach((key) => {
      const value = options[key];

      if (typeof value === 'undefined') {
        delete olSourceOptions[key];
      } else {
        olSourceOptions[key] = value;
      }
    });
    this.olSourceOptions_ = olSourceOptions;

    const newSource = new this.constructor.layerSourceClass(this.olSourceOptions_);
    this.olLayer_.setSource(newSource);

    return newSource;
  }

  /**
   * Set the new projection and also update other related properties (e.g. coordinates).
   * @param {string} fromProj
   * @param {string} toProj
   */
  switchProjection (fromProj, toProj) {
    this.log_('switchProjection', {
      fromProj,
      toProj
    });

    this.projection = toProj;

    const oldExtent = this.extent;

    if (!oldExtent) {
      return;
    }

    const newExtent = this.constructor.transformExtent(oldExtent, fromProj, toProj);

    this.logInfo_({
      oldExtent,
      newExtent
    });

    this.extent = newExtent;
  }

} // HTMLMapLayerBase
