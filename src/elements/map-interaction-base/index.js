import _ from 'lodash';

import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapInteractionBase></HTMLMapInteractionBase>
 */
export default class HTMLMapInteractionBase extends BaseClass {

  // @override
  static observedAttributes = _.concat(BaseClass.observedAttributes, []);

  // @override
  static attributeNameToPropertyNameMapping = _.merge({}, BaseClass.attributeNameToPropertyNameMapping, {});

  // @override
  static propertyNameToAttributeNameMapping = _.merge({}, BaseClass.propertyNameToAttributeNameMapping, {});

  // @override
  static attributeToPropertyConverters = _.merge({}, BaseClass.attributeToPropertyConverters, {});

  // @override
  static propertyToAttributeConverters = _.merge({}, BaseClass.propertyToAttributeConverters, {});

  // @override
  static propertyComparators = _.merge({}, BaseClass.propertyComparators, {});

  /**
   * Getters and Setters (for properties).
   */

  // @property {Array.<ol.interaction.Interaction>} interaction
  // @readonly
  get interactions () {
    throw new Error('Subclass should implement this.');
  }

} // HTMLMapInteractionBase
