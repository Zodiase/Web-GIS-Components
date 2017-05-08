import _ from 'lodash';

import HTMLMapControlBase from '../map-control-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultControls></HTMLMapDefaultControls>
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

  constructor () {
    super();

    // @type {ol.Collection.<ol.control.Control>}
    this.olControl_ = new this.ol.control.defaults({});
  }

  /**
   * Getters and Setters (for properties).
   */

  // @override
  get controls () {
    return this.olControl_.getArray();
  }

  // @override
  set mapElement (newMapElement) {
    super.mapElement = newMapElement;

    if (newMapElement) {
      this.olControl_.getArray().forEach((control) => {
        if (control.getMap() !== newMapElement.olMap) {
          control.setMap(newMapElement.olMap);
        }
      });
    }
  }

} // HTMLMapDefaultControls

customElements.define(elementName, HTMLMapDefaultControls);
