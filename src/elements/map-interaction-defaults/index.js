import _ from 'lodash';

import HTMLMapInteractionBase from '../map-interaction-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultInteractions></HTMLMapDefaultInteractions>
 */
export default class HTMLMapDefaultInteractions extends HTMLMapInteractionBase {

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

  constructor () {
    super();

    // @type {ol.Collection.<ol.interaction.Interaction>}
    this.olInteraction_ = new this.ol.interaction.defaults({});
  }

  /**
   * Getters and Setters (for properties).
   */

  // @override
  get interactions () {
    return this.olInteraction_.getArray();
  }

} // HTMLMapDefaultInteractions

customElements.define(elementName, HTMLMapDefaultInteractions);
