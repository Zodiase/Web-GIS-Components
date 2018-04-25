import webGisComponents from 'namespace';

import Color from './color';

export default
class HTMLMapVectorStyle {
  constructor (style = {}) {
    this._ = {
      /**
       * @type {Object}
       */
      fill: this.parseColorString_(style.fill),
      /**
       * @type {Object}
       */
      strokeColor: this.parseColorString_(style.strokeColor),
      /**
       * @type {number}
       */
      strokeWidth: this.getValidSize_(style.strokeWidth),
      /**
       * @type {number}
       */
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
    return String(this._.fill);
  }
  set fill (value) {
    this._.fill = this.parseColorString_(value);

    this.observable_.changed();
  }

  get strokeColor () {
    return String(this._.strokeColor);
  }
  set strokeColor (value) {
    this._.strokeColor = this.parseColorString_(value);

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

  /**
   * @param {string} colorString
   * @returns {Object}
   */
  parseColorString_ (colorString) {
    return new Color(colorString);
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
   * Returns a more generic representation of this style object.
   * Property names should still be in camel-case.
   * Property values should be converted into generic formats.
   * In other words, the consumer of the return value shouldn't need to know how the values are encoded/modeled.
   * @returns {Object}
   */
  valueOf () {
    // TODO: Only return explicitely defined styles.

    return Object.entries(this._).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: (typeof value === 'object' && value) ? value.toString() : value,
      };
    }, {});
  }
}
