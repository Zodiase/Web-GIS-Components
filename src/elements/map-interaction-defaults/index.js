import {
  concat,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';

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

  constructor () {
    super();

    // @type {ol.Collection.<ol.interaction.Interaction>}
    this.olInteraction_ = new webGisComponents.ol.interaction.defaults({});
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
