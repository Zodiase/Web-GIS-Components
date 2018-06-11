import webGisElements from 'namespace';

import HTMLMapLayerBase from '../map-layer-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapLayerGroup
 *   // @inheritdoc
 * ></HTMLMapLayerGroup>
 */
export default class HTMLMapLayerGroup extends HTMLMapLayerBase {

  // @override
  static get layerClass () {
    return webGisElements.ol.layer.Group;
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

    // Cache loaded items for comparison when items are updated.
    elementCollection._cachedItems = new Set();
    elementCollection._childLayerGroupOnChange = (function () {
      // When any child layer group has been changed, this layer group is also changed.
      this.changed();
    }).bind(elementCollection);

    elementCollection.on('change', ({/*type, */target: collection}) => {
      const layerElements = collection.getArray();

      // Find out what's added and what's removed.
      const layerElementSet = new Set(layerElements);
      const addedElements = layerElements.filter((el) => !elementCollection._cachedItems.has(el));
      const removedElements = Array.from(elementCollection._cachedItems).filter((el) => !layerElementSet.has(el));

      // Update the cache.
      elementCollection._cachedItems.clear();
      elementCollection._cachedItems = new Set(layerElements);

      // Children should have the same projection as the parent.
      this.alignLayerElementProjections(element, layerElements);

      // Update the layer collection.
      if (layerCollection) {
        const layers = layerElements.map((el) => el.layer);

        layerCollection.clear();
        layerCollection.extend(layers);
        layerCollection.changed();
      }

      // Remove listeners from removed elements.
      removedElements
        .filter((el) => el instanceof HTMLMapLayerGroup)
        .forEach((el) => el.removeEventListener('change:layers', elementCollection._childLayerGroupOnChange));

      // Add listeners to added elements.
      addedElements
        .filter((el) => el instanceof HTMLMapLayerGroup)
        .forEach((el) => el.addEventListener('change:layers', elementCollection._childLayerGroupOnChange));

      element.dispatchEvent(new Event('change:layers'));
    });

    return elementCollection;
  }

  constructor () {
    super();

    // This collection holds the child layer elements.
    // @type {ol.Collection.<HTMLMapLayerBase>}
    this.childLayerElementsCollection_ = this.constructor.getLiveChildLayerElementCollection(this, this.layer.getLayers());
  }

  /**
   * Getters and Setters (for properties).
   */

  /**
   * @readonly
   * @property {Array.<HTMLMapLayerBase>} layerElements
   */
  get layerElements () {
    return this.childLayerElementsCollection_.getArray();
  }

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

webGisElements.exposeComponentToGlobal(HTMLMapLayerGroup, elementName);
