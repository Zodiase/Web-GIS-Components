import _ from 'lodash';
import {
  typeCheck
} from 'type-check';

import HTMLMapControlBase from '../map-control-base';

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
  static get observedAttributes () {
    return _.concat(super.observedAttributes, [
      'collapsed',
    ]);
  }

  // @override
  static get attributeNameToPropertyNameMapping () {
    return _.merge({}, super.attributeNameToPropertyNameMapping, {
      'collapsed': 'collapsed',
    });
  }

  // @override
  static get propertyNameToAttributeNameMapping () {
    return _.merge({}, super.propertyNameToAttributeNameMapping, {
      'collapsed': 'collapsed',
    });
  }

  // @override
  static get attributeToPropertyConverters () {
    return _.merge({}, super.attributeToPropertyConverters, {
      'collapsed': (isSet/*, val*/) => isSet,
    });
  }

  // @override
  static get propertyToAttributeConverters () {
    return _.merge({}, super.propertyToAttributeConverters, {
      // @param {boolean|null} val - Boolean value to set or unset, null to unset.
      'collapsed': (val) => ({
        isSet: Boolean(val),
        value: 'collapsed',
      }),
    });
  }

  // @override
  static get propertyComparators () {
    return _.merge({}, super.propertyComparators, {
      'collapsed': (a, b) => a === b,
    });
  }

  constructor () {
    super();

    this.controlElement_ = document.createElement(template.name);

    // Reference the class name so others can find it.
    this.controlElement_.setAttribute('data-control-class', this.constructor.name);

    const shadowRoot = this.controlElement_.attachShadow({mode: 'open'});
    shadowRoot.appendChild(document.importNode(template.content, true));

    // @override
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

  // @property {boolean} collapsed
  get collapsed () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('collapsed'));
  }
  set collapsed (val) {
    if (!typeCheck('Boolean | Null', val)) {
      throw new TypeError('Collapsed has to be a boolean value.');
    }

    // Update internal models.
    if (val) {
      this.wrapper_.classList.add('collapsed');
    } else {
      this.wrapper_.classList.remove('collapsed');
    }

    this.updateAttributeByProperty_(this.constructor.getAttributeNameByPropertyName_('collapsed'), val);
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
    if (layerElement.constructor.name === 'HTMLMapLayerGroup') {
      return layerElement.layerElements.map((element) => this.renderLayerItem(element)).join('');
    } else {
      return `<li class="layer-item">${layerElement.name}</li>`;
    }
  }

} // HTMLMapSimpleLayerListControl

customElements.define(elementName, HTMLMapSimpleLayerListControl);
