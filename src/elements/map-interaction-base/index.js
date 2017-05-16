import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapInteractionBase></HTMLMapInteractionBase>
 */
export default class HTMLMapInteractionBase extends BaseClass {

  /**
   * Getters and Setters (for properties).
   */

  // @property {Array.<ol.interaction.Interaction>} interaction
  // @readonly
  get interactions () {
    throw new Error('Subclass should implement this.');
  }

} // HTMLMapInteractionBase
