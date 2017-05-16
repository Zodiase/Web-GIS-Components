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
