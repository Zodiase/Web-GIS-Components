import webGisElements from 'namespace';

import HTMLMapControlBase from '../map-control-base';

import {
  elementName,
} from './config';
import template from './template';

/**
 * Usage:
 * <HTMLMapScaleLineControl></HTMLMapScaleLineControl>
 */
export default class HTMLMapScaleLineControl extends HTMLMapControlBase {

  constructor () {
    super();

    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(document.importNode(template.content, true));

    // @type {ol.control.Control}
    this.olControl_ = new this.ol.control.ScaleLine({
      target: this.shadowRoot,
    });
  }

  /**
   * Getters and Setters (for properties).
   */

  // @override
  get controls () {
    return [this.olControl_];
  }

  // @override
  set mapElement (newMapElement) {
    super.mapElement = newMapElement;

    if (newMapElement) {
      if (this.olControl_.getMap() !== newMapElement.olMap) {
        this.olControl_.setMap(newMapElement.olMap);
      }
    }
  }

}

webGisElements.exposeComponentToGlobal(HTMLMapScaleLineControl, elementName);
