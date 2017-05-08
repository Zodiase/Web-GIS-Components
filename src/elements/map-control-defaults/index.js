import {
  concat,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';

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

    // @type {ol.Collection.<ol.control.Control>}
    this.olControl_ = new webGisComponents.ol.control.defaults({});
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
