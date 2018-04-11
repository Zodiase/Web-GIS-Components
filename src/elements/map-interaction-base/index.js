import webGisComponents from 'namespace';

import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapInteractionBase></HTMLMapInteractionBase>
 */
export default class HTMLMapInteractionBase extends BaseClass {

  constructor () {
    super();

    // @type {ol.Collection.<ol.interaction.Interaction>}
    this.olInteractions_ = new webGisComponents.ol.Collection();
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {ol.Collection.<ol.interaction.Interaction>} interactions
  // @readonly
  get interactions () {
    return this.olInteractions_;
  }

} // HTMLMapInteractionBase
