import _ from 'lodash';

import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapInteractionBase />
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
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor () {
    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    // @type {ol.interaction.Interaction}
    this.olInteraction_ = new this.ol.interaction.Interaction({});
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {ol.interaction.Interaction} interaction
  // @readonly
  get interaction () {
    return this.olInteraction_;
  }

} // HTMLMapInteractionBase