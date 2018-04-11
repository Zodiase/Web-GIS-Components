import {
  concat,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
  createBooleanPropertyToAttributeConverter,
} from 'helpers/custom-element-helpers';

import BaseClass from '../base';

/**
 * Usage:
 * <HTMLMapInteractionBase></HTMLMapInteractionBase>
 */
export default class HTMLMapInteractionBase extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'disabled',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'disabled': commonAttributeToPropertyConverters.bool,
  });

  // @override
  static propertyToAttributeConverters = merge({}, BaseClass.propertyToAttributeConverters, {
    'disabled': createBooleanPropertyToAttributeConverter('disabled'),
  });

  constructor () {
    super();

    /**
     * Child classes should not override this property but only modify its content.
     * @type {ol.Collection.<ol.interaction.Interaction>}
     */
    this.olInteractions_ = new webGisComponents.ol.Collection();

    // Newly added interactions should have consistent active state.
    this.olInteractions_.on('add', (olEvent) => {
      const newInteraction = olEvent.element;

      newInteraction.setActive(!this.disabled);
    });
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {ol.Collection.<ol.interaction.Interaction>} interactions
  // @readonly
  get interactions () {
    return this.olInteractions_;
  }

  /**
   * This is a reflected property.
   * @property {boolean} disabled
   */
  get disabled () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('disabled'));
  }
  set disabled (val) {
    const oldValue = this.disabled;
    const newValue = val === null ? null : Boolean(val);

    this.interactions.forEach((interaction) => {
      interaction.setActive(!newValue);
    });

    this.flushPropertyToAttribute('disabled', newValue, true);

    const event = new CustomEvent('change:disabled', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'disabled',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

} // HTMLMapInteractionBase
