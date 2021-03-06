import {
  concat,
  isEqual,
  merge,
} from 'lodash.local';

import webGisElements from 'namespace';
import {
  commonAttributeToPropertyConverters,
  commonPropertyToAttributeConverters,
} from 'helpers/custom-element-helpers';

import HTMLMapLayerBase from '../map-layer-base';

import {
  elementName,
} from './config';

import HTMLMapVectorStyle from './vector-style';

/**
 * Usage:
 * <HTMLMapLayerVector
 *   // @inheritdoc
 *
 *   This element is useless with only DOM properties. It could be used to store features for interactions.
 *
 *   // Specify the projection the source data coordinates are in. It will only be used when no CRS is available in the data. Default value is "EPSG:4326".
 *   src-projection="{string}"
 *   // Vector styling options.
 *   // Example: "fill: #FF0000; stroke-color: #00FF00; stroke-width: 5"
 *   style="{string}"
 * ></HTMLMapLayerVector>
 */
export default
class HTMLMapLayerVector extends HTMLMapLayerBase {

  // @override
  static observedAttributes = concat(HTMLMapLayerBase.observedAttributes, [
    'src-projection',
    'style',
  ]);

  // @override
  static attributeNameToPropertyNameMapping = merge({}, HTMLMapLayerBase.attributeNameToPropertyNameMapping, {
    'src-projection': 'srcProjection',
  });

  // @override
  static propertyNameToAttributeNameMapping = merge({}, HTMLMapLayerBase.propertyNameToAttributeNameMapping, {
    'srcProjection': 'src-projection',
  });

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapLayerBase.attributeToPropertyConverters, {
    'src-projection': commonAttributeToPropertyConverters.string,
    'style': commonAttributeToPropertyConverters.style,
  });

  // @override
  static propertyToAttributeConverters = merge({}, HTMLMapLayerBase.propertyToAttributeConverters, {
    'style': commonPropertyToAttributeConverters.style,
  });

  // @override
  static propertyComparators = merge({}, HTMLMapLayerBase.propertyComparators, {
    'style': (a, b) => isEqual(a, b),
  });

  static geometryFactories = {
    Circle: (geom) => new webGisElements.ol.geom.Circle(geom.center, geom.radius),
    LineString: (geom) => new webGisElements.ol.geom.LineString(geom.coordinates),
    MultiLineString: (geom) => new webGisElements.ol.geom.MultiLineString(geom.coordinates),
    MultiPoint: (geom) => new webGisElements.ol.geom.MultiPoint(geom.coordinates),
    MultiPolygon: (geom) => new webGisElements.ol.geom.MultiPolygon(geom.coordinates),
    Point: (geom) => new webGisElements.ol.geom.Point(geom.coordinates),
    Polygon: (geom) => new webGisElements.ol.geom.Polygon(geom.coordinates),
  };

  static defaultStyle = {
    fill: 'none',
    strokeColor: '#3399CC',
    strokeWidth: 1.25,
    vertexSize: 5,
  };

  /**
   * @param {string} geomType
   * @returns {boolean}
   */
  static isGeometryTypeSupported (geomType) {
    return geomType in this.geometryFactories;
  }

  /**
   * Create a geometry instance from an extent.
   * This does not reproject the coordinates.
   * @param {ol.Extent} extent
   * @returns {ol.geom.Geometry}
   */
  static createGeometryFromExtent (extent) {
    return webGisElements.ol.geom.Polygon.fromExtent(extent);
  }

  /**
   * Convert an Openlayers geometry to its GeoJSON counterpart.
   * @param {ol.geom.Geometry} geometry
   * @param {string} fromProj
   * @param {string} toProj
   * @returns {Object}
   */
  static writeGeometryObject (geometry, fromProj, toProj) {
    const format = new webGisElements.ol.format.GeoJSON({
      defaultDataProjection: toProj,
      featureProjection: fromProj,
    });

    return format.writeGeometryObject(geometry);
  }

  /**
   * Convert a GeoJSON geometry to its Openlayers counterpart.
   * @param {Object} geometry
   * @param {string} fromProj
   * @param {string} toProj
   * @returns {ol.geom.Geometry}
   */
  static readGeometryObject (geometry, fromProj, toProj) {
    const format = new webGisElements.ol.format.GeoJSON({
      defaultDataProjection: fromProj,
      featureProjection: toProj,
    });

    return format.readGeometry(geometry);
  }

  /**
   * @param {Object} geometry
   * @returns {Array.<number>}
   */
  static getExtentFromGeometry (geometry, proj) {
    const olGeometry = this.readGeometryObject(geometry, proj, proj);

    return olGeometry.getExtent();
  }

  /**
   * @param {Array.<number>} extent
   * @returns {Object}
   */
  static getGeometryFromExtent (extent, proj) {
    const olGeometry = this.createGeometryFromExtent(extent);

    return this.writeGeometryObject(olGeometry, proj, proj);
  }

  // @override
  static get layerClass () {
    return webGisElements.ol.layer.Vector;
  }

  // @override
  static get layerSourceClass () {
    return webGisElements.ol.source.Vector;
  }

  constructor () {
    super();

    // @type {string}
    this.srcProjection_ = this.constructor.IOProjection;

    // This should be a collection that emmits events about any property changes.
    // @type {HTMLMapVectorStyle}
    this.style_ = null;

    // Initialize layer source.
    this.updateSource({});

    this.updateStyle({});

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
      newValue = this.constructor.IOProjection;
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
   * @property {HTMLMapVectorStyle} style
   */
  get style () {
    return this.style_;
  }
  set style (val) {
    const oldValue = this.srcProjection;
    let newValue = val;
    if (typeof newValue === 'string') {
      newValue = this.constructor.attributeToPropertyConverters.style(newValue === '', newValue);
    }
    if (newValue === null) {
      newValue = {};
    }

    if (this.isIdenticalPropertyValue_('style', oldValue, newValue)) {
      return;
    }

    this.updateStyle(newValue);

    const event = new CustomEvent('change:style', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'style',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * Customized public/private methods.
   */

  onStyleChanged_ = () => {
    this.layer.setStyle(this.style_.olStyle);
    this.flushPropertyToAttribute('style', this.style_.valueOf(), true);
  };

  // @override
  updateSource (options) {
    const newSource = super.updateSource(options);

    this.listenToSourceEvents_(newSource);

    return newSource;
  }

  updateStyle (style) {
    const oldStyle = this.style_;

    if (oldStyle) {
      this.style_.observable.un('change', this.onStyleChanged_);
    }

    const newStyle = new HTMLMapVectorStyle(merge({}, this.constructor.defaultStyle, style));

    newStyle.observable.on('change', this.onStyleChanged_);

    this.style_ = newStyle;

    this.style_.observable.changed();
  }

  /**
   * Create a geometry instance from a geometry descriptor.
   * This does not reproject the coordinates.
   * @param {Object} geom
   * @returns {ol.geom.Geometry}
   */
  createGeometry (geom) {
    if (!this.constructor.isGeometryTypeSupported(geom.type)) {
      return null;
    }

    const olGeom = this.constructor.geometryFactories[geom.type](geom);

    return olGeom;
  }

  /**
   * Create a geometry instance from an extent.
   * This does not reproject the coordinates.
   * @param {ol.Extent} extent
   * @returns {ol.geom.Geometry}
   */
  createGeometryFromExtent (extent) {
    return this.constructor.createGeometryFromExtent(extent);
  }

  /**
   * Convert an Openlayers geometry to its GeoJSON counterpart.
   * The output geometry descriptor has coordinates in the source projection of this layer.
   * @param {ol.geom.Geometry} geometry
   * @returns {Object}
   */
  writeGeometryObject (geometry) {
    return this.constructor.writeGeometryObject(geometry, this.projection, this.srcProjection);
  }

  /**
   * Convert a GeoJSON geometry to its Openlayers counterpart.
   * The input geometry descriptor should have coordinates in the source projection of this layer.
   * @param {Object} geometry
   * @returns {ol.geom.Geometry}
   */
  readGeometryObject (geometry) {
    return this.constructor.readGeometryObject(geometry, this.srcProjection, this.projection);
  }

  /**
   * Creates a feature from a geometry.
   * This process does not involve reprojection so the input geometry should have proper coordinates.
   * @param {ol.geom.Geometry|Object} geom
   */
  createFeature (geom) {
    const olGeom = geom instanceof webGisElements.ol.geom.Geometry
      ? geom
      : this.createGeometry(geom);

    this.log_('createFeature', olGeom);

    return new webGisElements.ol.Feature({
      geometry: olGeom,
    });
  }

  /**
   * Adds a list of features that are already in the target projection.
   * @param {Array.<ol.Feature>} features
   */
  addFeatures (features) {
    return this.source.addFeatures(features);
  }

  /**
   * Adds a single feature that is already in the target projection.
   * @param {ol.Feature} feature
   */
  addFeature (feature) {
    return this.addFeatures([feature]);
  }

  /**
   * Take a list of features defined in the source projection and add them to the layer with the proper reprojection.
   * This mutates the input features.
   * @param {Array.<ol.Feature>} features
   */
  adoptFeatures (features) {
    features.forEach((feature) => {
      const geometry = feature.getGeometry();

      if (geometry) {
        // This modifies the geometry in place.
        geometry.transform(this.srcProjection, this.projection);
      }
    });

    return this.addFeatures(features);
  }

  /**
   * Take a feature defined in the source projection and add it to the layer with the proper reprojection.
   * This mutates the input feature.
   * @param {ol.Feature} feature
   */
  adoptFeature (feature) {
    return this.adoptFeatures([feature]);
  }

  /**
   * @param {ol.Feature} feature
   * @returns {ol.Feature}
   */
  cloneFeature (feature) {
    return feature.clone();
  }

  /**
   * @returns {Array.<ol.Feature>}
   */
  getFeatures () {
    return this.source.getFeatures();
  }

  /**
   * Reproject the input object, be it a feature or a geometry, from current projection to lat-long.
   * This mutates the input object.
   * @param {ol.Feature|ol.geom.Geometry|*} obj
   * @returns {ol.Feature|ol.geom.Geometry|*}
   */
  toLatLong (obj) {
    switch (true) {
    case obj instanceof webGisElements.ol.Feature:
      {
        const geometry = obj.getGeometry();

        if (geometry) {
          geometry.transform(this.projection, this.constructor.IOProjection);
        }
      }
      break;
    case obj instanceof webGisElements.ol.geom.Geometry:
      obj.transform(this.projection, this.constructor.IOProjection);
      break;
    default:
    }

    return obj;
  }

  /**
   * The reverse of `toLatLong`.
   * @param {ol.Feature|ol.geom.Geometry|*} obj
   * @returns {ol.Feature|ol.geom.Geometry|*}
   */
  fromLatLong (obj) {
    switch (true) {
    case obj instanceof webGisElements.ol.Feature:
      {
        const geometry = obj.getGeometry();

        if (geometry) {
          geometry.transform(this.constructor.IOProjection, this.projection);
        }
      }
      break;
    case obj instanceof webGisElements.ol.geom.Geometry:
      obj.transform(this.constructor.IOProjection, this.projection);
      break;
    default:
    }

    return obj;
  }

  /**
   * Remove a single feature from the layer.
   * @param {ol.Feature} feature
   */
  removeFeature (feature) {
    return this.source.removeFeature(feature);
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

webGisElements.exposeComponentToGlobal(HTMLMapLayerVector, elementName);
