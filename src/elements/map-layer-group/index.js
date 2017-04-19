import HTMLMapLayerBase from '../map-layer-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapLayerGroup
 *   // @inheritdoc
 * />
 */
export default class HTMLMapLayerGroup extends HTMLMapLayerBase {

  // @override
  static get layerClass () {
    return this.ol.layer.Group;
  }

  /**
   * Make the target elements have the same projection as the source element.
   * @param {HTMLElement} sourceElement
   * @param {Array.<HTMLMapLayerBase>} targetElements
   */
  static alignLayerElementProjections (sourceElement, targetElements) {
    // Only do this when the parent actually has a projection.
    if (sourceElement.projection && targetElements.length > 0) {
      const sourceProjection = sourceElement.projection;

      targetElements.forEach((el) => {
        const targetProjection = el.projection;
        if (!sourceElement.isIdenticalPropertyValue_('projection', sourceProjection, targetProjection)) {
          el.switchProjection(targetProjection, sourceProjection);
        }
      });
    }
  }

  /**
   * Returns a collection of the child layer elements.
   * The provided layer collection will also be auto-populated with all the layers.
   * The collection is auto-updated until `.disconnect()` is called.
   * Does it potentially leak observers?
   * @param {HTMLElement} element
   * @param {ol.Collection.<ol.layer.Base>} [layerCollection]
   * @returns {ol.Collection.<HTMLMapLayerBase>}
   */
  static getLiveChildLayerElementCollection (element, layerCollection) {
    const elementCollection = this.getLiveChildElementCollection(element, HTMLMapLayerBase);

    elementCollection.on('change', ({/*type, */target}) => {
      const layerElements = target.getArray();

      // Children should have the same projection as the parent.
      this.alignLayerElementProjections(element, layerElements);

      // Update the layer collection.
      if (layerCollection) {
        const layers = layerElements.map((el) => el.layer);

        layerCollection.clear();
        layerCollection.extend(layers);
        layerCollection.changed();
      }
    });

    return elementCollection;
  }

  /**
   * An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor.
   */
  constructor () {
    super(); // always call super() first in the ctor.

    // This collection holds the child layer elements.
    // @type {ol.Collection.<HTMLMapLayerBase>}
    this.childLayerElementsCollection_ = this.constructor.getLiveChildLayerElementCollection(this, this.layer.getLayers());
  } // constructor

  /**
   * Getters and Setters (for properties).
   */

  /**
   * Customized public/private methods.
   */

  // @override
  updateSource () {
    throw new Error('Can not update source of a layer group.');
  }

  // @override
  switchProjection (fromProj, toProj) {
    super.switchProjection(fromProj, toProj);

    // Tell children to switch projections as well.
    this.childLayerElementsCollection_.forEach((item) => item.switchProjection(fromProj, toProj));
  }

} // HTMLMapLayerGroup

customElements.define(elementName, HTMLMapLayerGroup);
