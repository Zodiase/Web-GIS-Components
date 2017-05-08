import _ from 'lodash';

import BaseClass from '../map-interaction-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultInteractions></HTMLMapDefaultInteractions>
 */
export default class HTMLMapDefaultInteractions extends BaseClass {

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
