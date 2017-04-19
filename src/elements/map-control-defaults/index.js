import _ from 'lodash';

import HTMLMapControlBase from '../map-control-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultControls />
 */
export default class HTMLMapDefaultControls extends HTMLMapControlBase {

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

    // @type {ol.control.Control}
    this.olControl_ = new this.ol.control.defaults({});
  }

  /**
   * Getters and Setters (for properties).
   */

} // HTMLMapDefaultControls

customElements.define(elementName, HTMLMapDefaultControls);
