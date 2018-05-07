import {
  clone,
  concat,
  merge,
} from 'lodash.local';

import webGisElements from 'namespace';
import {
  commonAttributeToPropertyConverters,
  createBooleanPropertyToAttributeConverter,
} from 'helpers/custom-element-helpers';

import HTMLMapInteractionBase from '../map-interaction-base';
import HTMLMapLayerBase from '../map-layer-base';

import {
  elementName,
  defaultDrawingType,
} from './config';

/**
 * Usage:
 * <HTMLMapDrawInteraction></HTMLMapDrawInteraction>
 */
export default class HTMLMapDrawInteraction extends HTMLMapInteractionBase {

  // @override
  static observedAttributes = concat(HTMLMapInteractionBase.observedAttributes, [
    'source',
    'freehand',
    'type',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapInteractionBase.attributeToPropertyConverters, {
    'source': commonAttributeToPropertyConverters.string,
    'freehand': commonAttributeToPropertyConverters.bool,
    'type': commonAttributeToPropertyConverters.string,
  });

  // @override
  static propertyToAttributeConverters = merge({}, HTMLMapInteractionBase.propertyToAttributeConverters, {
    'freehand': createBooleanPropertyToAttributeConverter('freehand'),
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
      geometryFunction: webGisElements.ol.interaction.Draw.createBox(),
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

    const drawingOptions = this.constructor.getDrawingOptions(newValue);

    this.updateInteraction(drawingOptions);

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
   * @property {string} freehand
   */
  get freehand () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('freehand'));
  }
  set freehand (val) {
    const oldValue = this.freehand;
    const newValue = Boolean(val);

    this.updateInteraction({
      freehand: newValue,
    });

    this.flushPropertyToAttribute('freehand', newValue, true);

    const event = new CustomEvent('change:freehand', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'freehand',
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
      if (!(sourceLayerSource && sourceLayerSource instanceof this.ol.source.Vector)) {
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

    const newInteraction = new this.ol.interaction.Draw(this.olInteractionOptions_);

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

webGisElements.exposeComponentToGlobal(HTMLMapDrawInteraction, elementName);
