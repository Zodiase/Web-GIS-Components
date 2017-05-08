import _ from 'lodash';

import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapInteractionBase></HTMLMapInteractionBase>
 */
export default class HTMLMapInteractionBase extends BaseClass {

  // @override
  static get observedAttributes () {
    return _.concat(super.observedAttributes, []);
  }

  // @override
  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {});
  }

  // @override
  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {});
  }

  // @override
  static get attributeToPropertyConverters () {
    return _.merge({}, super.attributeToPropertyConverters, {});
  }

  // @override
  static get propertyToAttributeConverters () {
    return _.merge({}, super.propertyToAttributeConverters, {});
  }

  // @override
  static get propertyComparators () {
    return _.merge({}, super.propertyComparators, {});
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {Array.<ol.interaction.Interaction>} interaction
  // @readonly
  get interactions () {
    throw new Error('Subclass should implement this.');
  }

} // HTMLMapInteractionBase
