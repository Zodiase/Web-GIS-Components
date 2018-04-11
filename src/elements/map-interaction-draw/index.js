import {
  clone,
  concat,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
} from 'helpers/custom-element-helpers';

import BaseClass from '../map-interaction-base';

import HTMLMapLayerBase from '../map-layer-base';

import {
  elementName,
  defaultDrawingType,
} from './config';

/**
 * Usage:
 * <HTMLMapDrawInteraction></HTMLMapDrawInteraction>
 */
export default class HTMLMapDrawInteraction extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'source',
    'type',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'source': commonAttributeToPropertyConverters.string,
    'type': commonAttributeToPropertyConverters.string,
  });

  static validTypes = {
    Point: () => ({
      type: 'Point',
    }),
    LineString: () => ({
      type: 'LineString',
    }),
    Polygon: () => ({
      type: 'Polygon',
    }),
    MultiPoint: () => ({
      type: 'MultiPoint',
    }),
    MultiLineString: () => ({
      type: 'MultiLineString',
    }),
    MultiPolygon: () => ({
      type: 'MultiPolygon',
    }),
    Circle: () => ({
      type: 'Circle',
    }),
    Box: () => ({
      type: 'Circle',
      geometryFunction: webGisComponents.ol.interaction.Draw.createBox(),
    }),
  };

  /**
   * @param {string} type
   * @returns {boolean}
   */
  static isValidType (type) {
    return type in this.validTypes;
  }

  /**
   * @param {string} type
   * @returns {Object}
   */
  static getDrawingOptions (type) {
    return this.validTypes[type]();
  }

  constructor () {
    super();

    // Used in constructor of ol.interaction.Interaction.
    this.olInteractionOptions_ = {
      type: defaultDrawingType,
    };
  }

  /**
   * Getters and Setters (for properties).
   */

  /**
   * This is a reflected property.
   * @property {string} type
   */
  get type () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('type'));
  }
  set type (val) {
    const oldValue = this.type;
    let newValue = val === null ? null : String(val);

    if (newValue === null || !this.constructor.isValidType(newValue)) {
      newValue = defaultDrawingType;
    }

    const {
      type,
      geometryFunction,
    } = this.constructor.getDrawingOptions(newValue);

    this.updateInteraction({
      type,
      geometryFunction,
    });

    this.flushPropertyToAttribute('type', newValue, true);

    const event = new CustomEvent('change:type', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'type',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is a reflected property.
   * @property {string|null} source
   */
  get source () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('source'));
  }
  set source (val) {
    const oldValue = this.source;
    const newValue = val === null ? null : String(val);
    const newSource = (() => {
      if (newValue === null) {
        return;
      }

      // Source element must be a valid layer element.
      const sourceLayerElement = document.getElementById(newValue);
      if (!(sourceLayerElement && sourceLayerElement instanceof HTMLMapLayerBase)) {
        return;
      }

      // Source element must have a vector source.
      const sourceLayerSource = sourceLayerElement.layer.getSource();
      if (!(sourceLayerSource && sourceLayerSource instanceof webGisComponents.ol.source.Vector)) {
        return;
      }

      return sourceLayerSource;
    })();

    this.updateInteraction({
      source: newSource,
    });

    this.flushPropertyToAttribute('source', newValue, true);

    const event = new CustomEvent('change:source', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'source',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * Use the options set in `this.olInteractionOptions_` to create a new interaction and use that.
   * Pass in `undefined` (or `void 0`) as value to delete a field.
   * @param {Object} options
   */
  updateInteraction (options) {
    const olInteractionOptions = clone(this.olInteractionOptions_);

    Object.keys(options).forEach((key) => {
      const value = options[key];

      if (typeof value === 'undefined') {
        delete olInteractionOptions[key];
      } else {
        olInteractionOptions[key] = value;
      }
    });

    this.olInteractionOptions_ = olInteractionOptions;

    this.interactions.clear();

    // Check if all required properties are present.
    if (!['source', 'type'].every((key) => key in this.olInteractionOptions_)) {
      return;
    }

    const newInteraction = new webGisComponents.ol.interaction.Draw(this.olInteractionOptions_);

    this.listenToInteractionEvents_(newInteraction);

    this.interactions.push(newInteraction);
    this.interactions.changed();
  }

  listenToInteractionEvents_ (interaction) {
    interaction.on('drawstart', (olEvent) => {
      const event = new CustomEvent('drawstart', {
        bubbles: true,
        // TODO: Make this cancelable.
        cancelable: false,
        scoped: false,
        composed: false,
        detail: {
          originalEvent: olEvent,
        },
      });

      this.dispatchEvent(event);
    });

    interaction.on('drawend', (olEvent) => {
      const event = new CustomEvent('drawend', {
        bubbles: true,
        // TODO: Make this cancelable.
        cancelable: false,
        scoped: false,
        composed: false,
        detail: {
          originalEvent: olEvent,
        },
      });

      this.dispatchEvent(event);
    });
  }

} // HTMLMapDrawInteraction

customElements.define(elementName, HTMLMapDrawInteraction);
