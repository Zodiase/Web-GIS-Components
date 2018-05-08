import webGisElements from 'namespace';

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

    // @type {Array.<ol.control.Control>}
    this.olControls_ = (new this.ol.control.defaults({})).getArray();
  }

  /**
   * Getters and Setters (for properties).
   */

  // @override
  get controls () {
    return this.olControls_;
  }

  // @override
  set mapElement (newMapElement) {
    super.mapElement = newMapElement;

    if (newMapElement) {
      this.olControls_.forEach((control) => {
        if (control.getMap() !== newMapElement.olMap) {
          control.setMap(newMapElement.olMap);
        }
      });
    }
  }

} // HTMLMapDefaultControls

webGisElements.exposeComponentToGlobal(HTMLMapDefaultControls, elementName);
