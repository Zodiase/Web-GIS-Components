import _ from 'lodash';

import BaseClass from '../map-control-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultControls></HTMLMapDefaultControls>
 */
export default class HTMLMapDefaultControls extends BaseClass {

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
