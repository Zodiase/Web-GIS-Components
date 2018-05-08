import {
  concat,
  merge,
} from 'lodash.local';

import webGisElements from 'namespace';
import {
  commonAttributeToPropertyConverters,
  createBooleanPropertyToAttributeConverter,
} from 'helpers/custom-element-helpers';

import HTMLMapControlBase from '../map-control-base';
import HTMLMapLayerGroup from '../map-layer-group';

import {
  elementName,
} from './config';
import template from './template';

/**
 * Usage:
 * <HTMLMapSimpleLayerListControl></HTMLMapSimpleLayerListControl>
 */
export default class HTMLMapSimpleLayerListControl extends HTMLMapControlBase {

  // @override
  static observedAttributes = concat(HTMLMapControlBase.observedAttributes, [
    'collapsed',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapControlBase.attributeToPropertyConverters, {
    'collapsed': commonAttributeToPropertyConverters.bool,
  });

  // @override
  static propertyToAttributeConverters = merge({}, HTMLMapControlBase.propertyToAttributeConverters, {
    'collapsed': createBooleanPropertyToAttributeConverter('collapsed'),
  });

  constructor () {
    super();

    this.controlElement_ = document.createElement(template.name);

    // Reference the class name so others can find it.
    this.controlElement_.setAttribute('data-control-class', this.constructor.name);

    const shadowRoot = this.controlElement_.attachShadow({mode: 'open'});
    shadowRoot.appendChild(document.importNode(template.content, true));

    // @type {ol.control.Control}
    this.olControl_ = new this.ol.control.Control({
      element: this.controlElement_,
    });

    // @override
    this.mapElementEvents_ = {
      'change:layers': this.mapLayersChanged_.bind(this),
    };

    // Helper function for finding an element under the shadow root.
    this.$$ = (selector) => shadowRoot.querySelector(selector);

    // @type {HTMLElement} - Wrapper of the entire content in the shadow root.
    this.wrapper_ = this.$$('#wrapper');

    // @type {HTMLElement} - The button used to toggle the list.
    this.toggleButton_ = this.$$('#toggleButton');

    // @type {HTMLElement} - Container of the layer list.
    this.listContainer_ = this.$$('#list-container');

    // Clicking the toggle button should toggle the collapsed state.
    this.toggleButton_.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
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

    // The wrapper should be collapsed by default.
    this.collapsed = true;

    // Update the list of layers now.
    this.renderLayerList();
  }

  /**
   * This is a reflected property.
   * @property {boolean} collapsed
   */
  get collapsed () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('collapsed'));
  }
  set collapsed (val) {
    const oldValue = this.collapsed;
    const newValue = val === null ? null : Boolean(val);

    if (newValue) {
      this.wrapper_.classList.add('collapsed');
    } else {
      this.wrapper_.classList.remove('collapsed');
    }

    this.flushPropertyToAttribute('collapsed', newValue, true);

    const event = new CustomEvent('change:collapsed', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'collapsed',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * Customized public/private methods.
   */

  /**
   * Handler for layer changes.
   */
  mapLayersChanged_ () {
    this.renderLayerList();
  }

  /**
   * Render the entire layer list.
   */
  renderLayerList () {
    const layerElements = this.mapElement_ ? this.mapElement_.layerElements : [];

    this.listContainer_.innerHTML = `<ol>${layerElements.map((element) => this.renderLayerItem(element)).join('')}</ol>`;
  }

  /**
   * Render a single layer item in the list.
   */
  renderLayerItem (layerElement) {
    if (layerElement instanceof HTMLMapLayerGroup) {
      return layerElement.layerElements.map((element) => this.renderLayerItem(element)).join('');
    } else {
      return `<li class="layer-item">${layerElement.name}</li>`;
    }
  }

} // HTMLMapSimpleLayerListControl

webGisElements.exposeComponentToGlobal(HTMLMapSimpleLayerListControl, elementName);
