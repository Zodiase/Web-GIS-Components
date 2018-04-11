import {
  concat,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
} from 'helpers/custom-element-helpers';

import BaseClass from '../map-layer-base';

import {
  elementName,
  defaultDataProjection,
} from './config';

/**
 * Usage:
 * <HTMLMapLayerVector
 *   // @inheritdoc
 *
 *   This element is useless with only DOM properties. It could be used to store features for interactions.
 *
 *   // Specify the projection the source data coordinates are in. It will only be used when no CRS is available in the data. Default value is "EPSG:4326".
 *   src-projection="{string}"
 * >
 *   <HTMLMapLayerVectorStyle ...></HTMLMapLayerVectorStyle>
 * </HTMLMapLayerVector>
 */
export default class HTMLMapLayerVector extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'src-projection',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, BaseClass.attributeNameToPropertyNameMapping, {
    'src-projection': 'srcProjection',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, BaseClass.propertyNameToAttributeNameMapping, {
    'srcProjection': 'src-projection',
  });

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'src-projection': commonAttributeToPropertyConverters.string,
  });

  static geometryFactories = {
    Circle: (geom) => new webGisComponents.ol.geom.Circle(geom.center, geom.radius),
    LineString: (geom) => new webGisComponents.ol.geom.LineString(geom.coordinates),
    MultiLineString: (geom) => new webGisComponents.ol.geom.MultiLineString(geom.coordinates),
    MultiPoint: (geom) => new webGisComponents.ol.geom.MultiPoint(geom.coordinates),
    MultiPolygon: (geom) => new webGisComponents.ol.geom.MultiPolygon(geom.coordinates),
    Point: (geom) => new webGisComponents.ol.geom.Point(geom.coordinates),
    Polygon: (geom) => new webGisComponents.ol.geom.Polygon(geom.coordinates),
  };

  /**
   * @param {string} geomType
   * @returns {boolean}
   */
  static isGeometryTypeSupported (geomType) {
    return geomType in this.geometryFactories;
  }

  // @override
  static get layerClass () {
    return webGisComponents.ol.layer.Vector;
  }

  // @override
  static get layerSourceClass () {
    return webGisComponents.ol.source.Vector;
  }

  constructor () {
    super();

    // @type {string}
    this.srcProjection_ = defaultDataProjection;

    // Initialize layer source.
    this.updateSource({});

    this.listenToSourceEvents_(this.source);

    // TODO: Add support to load features from child DOM nodes?
  }

  /**
   * Getters and Setters (for properties).
   */

  // @property {ol.source.Vector} source
  // @readonly
  get source () {
    return this.layer.getSource();
  }

  /**
   * This is not a reflected property.
   * Setting an invalid property value silently fails.
   * @property {string|null} srcProjection
   */
  get srcProjection () {
    return this.srcProjection_;
  }
  set srcProjection (val) {
    const oldValue = this.srcProjection;
    let newValue = val === null ? null : String(val);

    if (newValue === null || !this.constructor.isValidProjection(newValue)) {
      newValue = defaultDataProjection;
    }

    if (this.isIdenticalPropertyValue_('srcProjection', oldValue, newValue)) {
      return;
    }

    this.srcProjection_ = newValue;

    const event = new CustomEvent('change:srcProjection', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'srcProjection',
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
   * @param {Object} geom
   * @returns {ol.geom.Geometry}
   */
  createGeometry (geom) {
    if (!this.constructor.isGeometryTypeSupported(geom.type)) {
      return null;
    }

    const olGeom = this.constructor.geometryFactories[geom.type](geom);

    olGeom.transform(this.srcProjection, this.projection);

    return olGeom;
  }

  /**
   * @param {ol.Extent} extent
   * @returns {ol.geom.Geometry}
   */
  createGeometryFromExtent (extent) {
    return this.ol.geom.Polygon.fromExtent(extent);
  }

  /**
   * Convert an Openlayers geometry to its GeoJSON counterpart.
   * @param {ol.geometry.Geometry} geometry
   * @returns {Object}
   */
  writeGeometryObject (geometry) {
    const format = new this.ol.format.GeoJSON({
      defaultDataProjection: this.srcProjection,
      featureProjection: this.projection,
    });

    return format.writeGeometryObject(geometry);
  }

  /**
   * Convert a GeoJSON geometry to its Openlayers counterpart.
   * @param {Object} geometry
   * @returns {ol.geometry.Geometry}
   */
  readGeometryObject (geometry) {
    const format = new this.ol.format.GeoJSON({
      defaultDataProjection: this.srcProjection,
      featureProjection: this.projection,
    });

    return format.readGeometry(geometry);
  }

  /**
   * Creates a feature from a geometry.
   * @param {ol.geom.Geometry|Object} geom
   */
  createFeature (geom) {
    const olGeom = geom instanceof this.ol.geom.Geometry
                   ? geom
                   : this.createGeometry(geom);

    this.log_('createFeature', olGeom);

    return new this.ol.Feature({
      geometry: olGeom,
    });
  }

  /**
   * Adds a list of features.
   * @param {Array.<ol.Feature>} features
   */
  addFeatures (features) {
    return this.source.addFeatures(features);
  }

  /**
   * Adds a single feature.
   * @param {ol.Feature} feature
   */
  addFeature (feature) {
    return this.addFeatures([feature]);
  }

  /**
   * @returns {Array.<ol.Feature>}
   */
  getFeatures () {
    return this.source.getFeatures();
  }

  /**
   * Removes all features.
   */
  clearFeatures () {
    return this.source.clear();
  }

  // @override
  switchProjection (fromProj, toProj) {
    super.switchProjection(fromProj, toProj);

    // Transform all features.
    this.source.forEachFeature((feature) => {
      const geom = feature.getGeometry();
      if (geom) {
        geom.transform(fromProj, toProj);
      }
    });
  }

  listenToSourceEvents_ (source) {
    source.on('addfeature', (olEvent) => {
      const event = new CustomEvent('addfeature', {
        bubbles: true,
        // TODO: Make this cancelable.
        cancelable: false,
        scoped: false,
        composed: false,
        detail: {
          originalEvent: olEvent,
        },
      });

      event.feature = olEvent.feature;

      this.dispatchEvent(event);
    });
  }

} // HTMLMapLayerVector

customElements.define(elementName, HTMLMapLayerVector);
