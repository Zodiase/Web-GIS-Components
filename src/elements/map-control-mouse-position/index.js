import {
  concat,
  merge,
} from 'lodash.local';

import webGisElements from 'namespace';
import {
  commonAttributeToPropertyConverters,
} from 'helpers/custom-element-helpers';

import HTMLMapControlBase from '../map-control-base';

import {
  elementName,
  defaultViewProjection,
  defaultCoordinateDecimals,
} from './config';
import template from './template';

/**
 * Usage:
 * <HTMLMapMousePositionControl
 *   // Projection of the displayed coordinates.
 *   projection="{string}"
 * ></HTMLMapMousePositionControl>
 */
export default class HTMLMapMousePositionControl extends HTMLMapControlBase {

  // @override
  static observedAttributes = concat(HTMLMapControlBase.observedAttributes, [
    'projection',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapControlBase.attributeToPropertyConverters, {
    'projection': commonAttributeToPropertyConverters.string,
  });

  constructor () {
    super();

    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(document.importNode(template.content, true));

    // @type {number}
    this.coordinateDecimals_ = defaultCoordinateDecimals;

    // @type {ol.control.Control}
    this.olControl_ = new webGisElements.ol.control.MousePosition({
      coordinateFormat: webGisElements.ol.coordinate.createStringXY(this.coordinateDecimals_),
      projection: defaultViewProjection,
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

  /**
   * This is not a reflected property.
   * Setting an invalid property value silently fails.
   * @property {string|null} projection
   */
  get projection () {
    return this.olControl_.getProjection();
  }
  set projection (val) {
    const oldValue = this.projection;
    let newValue = val === null ? null : String(val);

    if (newValue === null || !this.constructor.isValidProjection(newValue)) {
      newValue = defaultViewProjection;
    }

    if (this.isIdenticalPropertyValue_('projection', oldValue, newValue)) {
      return;
    }

    this.olControl_.setProjection(newValue);

    const event = new CustomEvent('change:projection', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'projection',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

}

webGisElements.exposeComponentToGlobal(HTMLMapMousePositionControl, elementName);
