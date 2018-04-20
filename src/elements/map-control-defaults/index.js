import webGisComponents from 'namespace';

import HTMLMapControlBase from '../map-control-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultControls></HTMLMapDefaultControls>
 */
export default class HTMLMapDefaultControls extends HTMLMapControlBase {

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

webGisComponents.exposeComponentToGlobal(HTMLMapDefaultControls, elementName);
