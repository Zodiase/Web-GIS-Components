import {
  clone,
  concat,
  merge,
} from 'lodash.local';
import {
  typeCheck
} from 'type-check';

import webGisComponents from 'namespace';

import BaseClass from '../base';

import {
  defaultLayerOpacity,
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
export default class HTMLMapLayerBase extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'name',
    'opacity',
    'extent',
    'invisible',
    'min-resolution',
    'max-resolution',
    'projection',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, BaseClass.attributeNameToPropertyNameMapping, {
    'min-resolution': 'minResolution',
    'max-resolution': 'maxResolution',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, BaseClass.propertyNameToAttributeNameMapping, {
    'minResolution': 'min-resolution',
    'maxResolution': 'max-resolution',
  });

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'name': (isSet, val) => (
      isSet
      ? val.trim()
      : null
    ),
    'opacity': (isSet, val) => (
      isSet
      ? parseFloat(val)
      : null
    ),
    'extent': (isSet, val) => (
      isSet
      ? val.split(',')
           .map((v) => v.trim())
           .map((v) => parseFloat(v))
      : null
    ),
    'invisible': (isSet/*, val*/) => isSet,
    'min-resolution': (isSet, val) => (
      isSet
      ? parseFloat(val)
      : null
    ),
    'max-resolution': (isSet, val) => (
      isSet
      ? parseFloat(val)
      : null
    ),
    'projection': (isSet, val) => (
      isSet
      ? val
      : null
    ),
  });

  // @override
  static propertyToAttributeConverters = merge({}, BaseClass.propertyToAttributeConverters, {
    // @param {string|null} val - String value to be set, null to unset.
    'name': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : val,
    }),
    // @param {number|null} val - Number value to be set, null to unset.
    'opacity': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : String(val),
    }),
    // @param {Array.<number>|null} val - Array of 4 numbers value to be set, null to unset.
    'extent': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : val.join(', '),
    }),
    // @param {boolean|null} val - Boolean value to set or unset, null to unset.
    'invisible': (val) => ({
      isSet: Boolean(val),
      value: 'invisible',
    }),
    // @param {number|null} val - Number value to be set, null to unset.
    'min-resolution': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : String(val),
    }),
    // @param {number|null} val - Number value to be set, null to unset.
    'max-resolution': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : String(val),
    }),
    // @param {string|null} val - String value to be set, null to unset.
    'projection': (val) => ({
      isSet: !(val === null),
      value: (val === null) ? '' : val,
    }),
  });

  // @override
  static propertyComparators = merge({}, BaseClass.propertyComparators, {
    'name': (a, b) => a === b,
    'opacity': (a, b) => a === b,
    'extent': (a, b) => a !== null && b !== null && a.length === b.length && a.every((x, i) => x === b[i]),
    'invisible': (a, b) => a === b,
    'min-resolution': (a, b) => a === b,
    'max-resolution': (a, b) => a === b,
    'projection': (a, b) => a === b,
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
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {ol.layer.Base} layer
  // @readonly
  get layer () {
    return this.olLayer_;
  }

  // @property {string|null} name
  get name () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('name'));
  }
  set name (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Layer name has to be a string.');
    }

    const _val = typeCheck('String', val) ? val.trim() : val;

    // Update internal models.
    const oldVal = this.olLayer_.get('name');
    if (!this.isIdenticalPropertyValue_('name', oldVal, _val)) {
      this.olLayer_.set('name', _val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('name'), _val);
  }

  // @property {number} opacity
  get opacity () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('opacity'));
    return propValFromAttr === null ? defaultLayerOpacity : propValFromAttr;
  }
  set opacity (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer opacity has to be a number.');
    }

    if (typeCheck('Number', val)) {
      if (val > 1 || val < 0) {
        throw new RangeError('Layer opacity should be between 0 and 1.');
      }
    }

    // Update internal models.
    const oldVal = this.olLayer_.getOpacity();
    if (!this.isIdenticalPropertyValue_('opacity', oldVal, val)) {
      this.olLayer_.setOpacity(val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('opacity'), val);
  }

  // @property {Array.<number>|null} extent
  get extent () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('extent'));
  }
  set extent (val) {
    if (!typeCheck('(Number, Number, Number, Number) | Null', val)) {
      throw new TypeError('Layer extent has to be an array of 4 numbers.');
    }

    // Update internal models.
    const oldVal = this.olLayer_.getExtent() || null;
    if (!this.isIdenticalPropertyValue_('extent', oldVal, val)) {
      this.olLayer_.setExtent(val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('extent'), val);
  }

  // @property {boolean} invisible
  get invisible () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('invisible'));
  }
  set invisible (val) {
    if (!typeCheck('Boolean | Null', val)) {
      throw new TypeError('Invisible has to be a boolean value.');
    }

    // Update internal models.
    const oldVal = !this.olLayer_.getVisible();
    if (!this.isIdenticalPropertyValue_('invisible', oldVal, val)) {
      this.olLayer_.setVisible(!val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('invisible'), val);
  }

  // @property {number} minResolution
  get minResolution () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('minResolution'));
  }
  set minResolution (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer minimum resolution has to be a number.');
    }

    // Update internal models.
    const oldVal = this.olLayer_.getMinResolution();
    if (!this.isIdenticalPropertyValue_('minResolution', oldVal, val)) {
      this.olLayer_.setMinResolution(val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('minResolution'), val);
  }

  // @property {number} maxResolution
  get maxResolution () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('maxResolution'));
  }
  set maxResolution (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Layer maximum resolution has to be a number.');
    }

    // Update internal models.
    const oldVal = this.olLayer_.getMaxResolution();
    if (!this.isIdenticalPropertyValue_('maxResolution', oldVal, val)) {
      this.olLayer_.setMaxResolution(val);
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('maxResolution'), val);
  }

  // @property {string|null} projection
  get projection () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('projection'));
    return propValFromAttr === null ? defaultLayerProjection : propValFromAttr;
  }
  set projection (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Layer projection has to be a string.');
    }

    if (val !== null && !this.constructor.isValidProjection(val)) {
      throw new TypeError('Invalid projection.');
    }

    // Update attributes.
    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('projection'), val);
  }

  /**
   * Customized public/private methods.
   */

  /**
   * Use the options set in `this.olSourceOptions_` to create a new layer source and use that in the layer.
   * Since this creates a new source thus loosing all the cached data in the old one, don't use this for minor changes.
   * Pass in `undefined` (or `void 0`) as value to delete a field.
   * @param {Object} options
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
