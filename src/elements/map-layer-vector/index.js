import {
  concat,
  isEqual,
  merge,
} from 'lodash.local';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
  commonPropertyToAttributeConverters,
  toCamelCasedObject,
} from 'helpers/custom-element-helpers';

import HTMLMapLayerBase from '../map-layer-base';

import {
  elementName,
} from './config';

class HTMLMapVectorStyle {
  constructor (style = {}) {
    this._ = {
      fill: this.getValidColorString_(style.fill),
      strokeColor: this.getValidColorString_(style.strokeColor),
      strokeWidth: this.getValidSize_(style.strokeWidth),
      vertexSize: this.getValidSize_(style.vertexSize),
    };

    this.observable_ = new this.ol.Observable();
  }

  get ol () {
    return webGisComponents.ol;
  }

  get observable () {
    return this.observable_;
  }

  get olStyle () {
    return this.getOlStyle_();
  }

  get fill () {
    return this._.fill || 'none';
  }
  set fill (value) {
    this._.fill = this.getValidColorString_(value);

    this.observable_.changed();
  }

  get strokeColor () {
    return this._.strokeColor || 'transparent';
  }
  set strokeColor (value) {
    this._.strokeColor = this.getValidColorString_(value);

    this.observable_.changed();
  }

  get strokeWidth () {
    return this._.strokeWidth || 0;
  }
  set strokeWidth (value) {
    this._.strokeWidth = this.getValidSize_(value);

    this.observable_.changed();
  }

  get vertexSize () {
    return this._.vertexSize || 0;
  }
  set vertexSize (value) {
    this._.vertexSize = this.getValidSize_(value);

    this.observable_.changed();
  }

  getValidColorString_ (colorString) {
    //!
    return colorString;
  }

  getValidSize_ (size) {
    let value = size;

    if (typeof value !== 'number') {
      if (typeof value === 'string') {
        value = parseFloat(value);
      } else {
        value = Number(value);
      }
    }

    if (isNaN(value)) {
      value = 0;
    } else {
      value = Math.max(value, 0);
    }

    return value;
  }

  getOlStyle_ () {
    const {
      ol,
      fill: fillColor,
      strokeColor,
      strokeWidth,
      vertexSize,
    } = this;

    const olFill = fillColor === 'none'
      ? null
      : new ol.style.Fill({
        color: fillColor,
      });

    const olStroke = strokeWidth === 0
      ? null
      : new ol.style.Stroke({
        color: strokeColor,
        width: strokeWidth,
      });

    const olVertexImage = vertexSize === 0
      ? null
      : new ol.style.Circle({
        fill: olFill,
        stroke: olStroke,
        radius: vertexSize,
      });

    const style = new ol.style.Style({
      image: olVertexImage,
      fill: olFill,
      stroke: olStroke,
    });

    return style;
  }

  /**
   * @returns {Object}
   */
  valueOf () {
    // TODO: Only return explicitely defined styles.
    return this._;
  }
}

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
export default class HTMLMapLayerVector extends HTMLMapLayerBase {

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
    'style': commonAttributeToPropertyConverters.getQueryStringParser(';', ':'),
  });

  // @override
  static propertyToAttributeConverters = merge({}, HTMLMapLayerBase.propertyToAttributeConverters, {
    'style': commonPropertyToAttributeConverters.getQueryStringBuilder(';', ':'),
  });

  // @override
  static propertyComparators = merge({}, HTMLMapLayerBase.propertyComparators, {
    'style': (a, b) => isEqual(a, b),
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

  // @override
  static get layerClass () {
    return this.ol.layer.Vector;
  }

  // @override
  static get layerSourceClass () {
    return this.ol.source.Vector;
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
    newValue = toCamelCasedObject(newValue);

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
    return this.ol.geom.Polygon.fromExtent(extent);
  }

  /**
   * Convert an Openlayers geometry to its GeoJSON counterpart.
   * The output geometry descriptor has coordinates in the source projection of this layer.
   * @param {ol.geom.Geometry} geometry
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
   * The input geometry descriptor should have coordinates in the source projection of this layer.
   * @param {Object} geometry
   * @returns {ol.geom.Geometry}
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
   * This process does not involve reprojection so the input geometry should have proper coordinates.
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
    case obj instanceof this.ol.Feature:
      {
        const geometry = obj.getGeometry();

        if (geometry) {
          geometry.transform(this.projection, this.constructor.IOProjection);
        }
      }
      break;
    case obj instanceof this.ol.geom.Geometry:
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
    case obj instanceof this.ol.Feature:
      {
        const geometry = obj.getGeometry();

        if (geometry) {
          geometry.transform(this.constructor.IOProjection, this.projection);
        }
      }
      break;
    case obj instanceof this.ol.geom.Geometry:
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

webGisComponents.exposeComponentToGlobal(HTMLMapLayerVector, elementName);
