import {
  concat,
  merge,
} from 'lodash.local';

import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapInteractionBase></HTMLMapInteractionBase>
 */
export default class HTMLMapInteractionBase extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, []);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, BaseClass.attributeNameToPropertyNameMapping, {});

  // @override
  static propertyNameToAttributeNameMapping = merge({}, BaseClass.propertyNameToAttributeNameMapping, {});

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {});

  // @override
  static propertyToAttributeConverters = merge({}, BaseClass.propertyToAttributeConverters, {});

  // @override
  static propertyComparators = merge({}, BaseClass.propertyComparators, {});

  /**
   * Getters and Setters (for properties).
   */

  // @property {Array.<ol.interaction.Interaction>} interaction
  // @readonly
  get interactions () {
    throw new Error('Subclass should implement this.');
  }

} // HTMLMapInteractionBase
