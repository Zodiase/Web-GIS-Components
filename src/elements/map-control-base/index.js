import _ from 'lodash';

import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapControlBase></HTMLMapControlBase>
 */
export default class HTMLMapControlBase extends BaseClass {

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

    // @type {HTMLMapView|null} - Reference to the map element.
    this.mapElement_ = null;

    // @type {Object.<function>} - A map of event handlers.
    this.mapElementEvents_ = {};
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {Array.<ol.control.Control>} controls
  // @readonly
  get controls () {
    throw new Error('Subclass should implement this.');
  }

  /**
   * @property {HTMLMapView|null} mapElement
   */
  get mapElement () {
    return this.mapElement_;
  }
  /**
   * Bind this control element to a new map element.
   */
  set mapElement (newMapElement) {
    const oldMapElement = this.mapElement_;

    if (newMapElement === oldMapElement) {
      return;
    }

    if (oldMapElement) {
      // Clean up the old map.

      Object.keys(this.mapElementEvents_).forEach((eventName) => {
        oldMapElement.removeEventListener(eventName, this.mapElementEvents_[eventName]);
      });
    }

    this.mapElement_ = newMapElement;

    if (newMapElement) {
      // Bind the new map.

      Object.keys(this.mapElementEvents_).forEach((eventName) => {
        newMapElement.addEventListener(eventName, this.mapElementEvents_[eventName]);
      });
    }
  }

} // HTMLMapControlBase
