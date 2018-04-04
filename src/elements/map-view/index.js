import {
  concat,
  merge,
} from 'lodash.local';
import {
  typeCheck
} from 'type-check';

import webGisComponents from 'namespace';
import {
  commonAttributeToPropertyConverters,
  createBooleanPropertyToAttributeConverter,
  commonPropertyToAttributeConverters,
  commonPropertyComparators,
} from 'helpers/custom-element-helpers';

import BaseClass from '../base';

import HTMLMapControlBase from '../map-control-base';
import HTMLMapInteractionBase from '../map-interaction-base';

import HTMLMapLayerGroup from '../map-layer-group';

import {
  elementName,
  defaultMapType,
  defaultViewProjection,
  defaultCenter,
} from './config';
import template from './template';
import {
  getBaseMap,
} from './basemap';

export default class HTMLMapView extends BaseClass {

  // @override
  static observedAttributes = concat(BaseClass.observedAttributes, [
    'disabled',
    'basemap',
    'projection',
    'extent',
    'center',
    'zoom',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, BaseClass.attributeToPropertyConverters, {
    'disabled': commonAttributeToPropertyConverters.bool,
    'basemap': commonAttributeToPropertyConverters.string,
    'projection': commonAttributeToPropertyConverters.string,
    'center': commonAttributeToPropertyConverters.array_number,
    'zoom': commonAttributeToPropertyConverters.number,
    'extent': commonAttributeToPropertyConverters.array_number,
  });

  // @override
  static propertyToAttributeConverters = merge({}, BaseClass.propertyToAttributeConverters, {
    'disabled': createBooleanPropertyToAttributeConverter('disabled'),
    'center': commonPropertyToAttributeConverters.array_simple,
  });

  // @override
  static propertyComparators = merge({}, BaseClass.propertyComparators, {
    'center': commonPropertyComparators.array,
    'extent': commonPropertyComparators.array,
  });

  constructor () {
    super();

    const {
      ol
    } = this;

    // Attach a shadow root to <fancy-tabs>.
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(document.importNode(template.content, true));

    // Get references to all elements here.
    this.mapElement_ = shadowRoot.querySelector('#map');
    this.layerList_ = shadowRoot.querySelector('#layer-list');

    // Some caching stores.
    this.baseMapCache_ = {};
    this.viewCache_ = {}; //! Not used at the moment.

    // Controls are tied to the map view.
    // @type {ol.Collection.<ol.control.Control>}
    this.mapControlCollection_ = new ol.Collection();

    // Control Elements in this map view.
    // @type {ol.Collection.<HTMLMapControlBase>}
    this.mapControlElementCollection_ = this.getLiveChildElementCollection(HTMLMapControlBase);

    this.mapControlElementCollection_.on('change', ({/*type, */target}) => {
      const controlElements = target.getArray();
      const controls = controlElements.map((el) => el.controls)
                                      .reduce((acc, controlArray) => [
                                        ...acc,
                                        ...controlArray,
                                      ], []);

      this.mapControlCollection_.clear();
      this.mapControlCollection_.extend(controls);
      this.mapControlCollection_.changed();

      // All `control.setMap`s have been called at this point.
      controlElements.forEach((element) => {
        element.mapElement = this;
      });

      this.dispatchEvent(new Event('change:controls'));
    });

    // Overlays are tied to geolocations.
    this.mapOverlays_ = new ol.Collection();

    // Interactions are tied to the map view.
    // @type {ol.Collection.<ol.interaction.Interaction>}
    this.mapInteractionCollection_ = new ol.Collection();

    // Interaction Elements in this map view.
    // @type {ol.Collection.<HTMLMapInteractionBase>}
    this.mapInteractionElementCollection_ = this.getLiveChildElementCollection(HTMLMapInteractionBase);

    this.mapInteractionElementCollection_.on('change', ({/*type, */target}) => {
      const interactionElements = target.getArray();
      const interactions = interactionElements.map((el) => el.interactions)
                                      .reduce((acc, controlArray) => [
                                        ...acc,
                                        ...controlArray,
                                      ], []);

      this.mapInteractionCollection_.clear();
      this.mapInteractionCollection_.extend(interactions);
      this.mapInteractionCollection_.changed();

      this.dispatchEvent(new Event('change:interactions'));
    });

    // This collection holds the child layers so it's easier to do batch updates.
    // @type {ol.Collection.<ol.layer.Base>}
    this.childMapLayerCollection_ = new ol.Collection();

    // This collection holds the child layer elements.
    // @type {ol.Collection.<HTMLMapLayerBase>}
    this.childLayerElementsCollection_ = HTMLMapLayerGroup.getLiveChildLayerElementCollection(this, this.childMapLayerCollection_);

    this.childLayerElementsCollection_.on('change', (/*{type, target}*/) => {
      this.dispatchEvent(new Event('change:layers'));
    });

    // This collection holds the base map.
    this.baseMapLayerCollection_ = new ol.Collection([
      getBaseMap(defaultMapType, this.baseMapCache_)
    ]);

    // Options for instantiating the view.
    this.olViewOptions_ = {
      center: defaultCenter,
      constrainRotation: true,
      enableRotation: true,
      maxZoom: 28,
      minZoom: 0,
      projection: defaultViewProjection,
      rotation: 0,
      zoom: 3,
      zoomFactor: 2,
    };

    // Stores the active ol.View.
    this.mapView_ = null;
    this.updateView_();

    this.olMap_ = new ol.Map({
      controls: this.mapControlCollection_,
      interactions: this.mapInteractionCollection_,
      keyboardEventTarget: this.mapElement_,
      layers: [
        new ol.layer.Group({
          opacity: 1,
          visible: 1,
          //extent:
          zIndex: 0,
          layers: this.baseMapLayerCollection_
        }),
        new ol.layer.Group({
          opacity: 1,
          visible: 1,
          //extent:
          zIndex: 1,
          layers: this.childMapLayerCollection_
        }),
      ],
      loadTilesWhileAnimating: false,
      loadTilesWhileInteracting: false,
      logo: false,
      overlays: this.mapOverlays_,
      renderer: 'canvas',
      target: this.mapElement_,
      view: null
    });

    /**
     * Naively proxy ol.Map clicking events to this element.
     * Had to use a different event name to prevent double-firing.
     * Maybe there's a workaround.
     */
    this.olMap_.on('click', (olEvent) => {
      olEvent.preventDefault();
      olEvent.stopPropagation();

      const event = new Event('click:view');

      event.fromMap_ = true;

      // For convenience, add a version of the coordinate in lat long.
      event.latLongCoordinate = webGisComponents.ol.proj.transform(olEvent.coordinate, this.projection, "EPSG:4326");

      // Copy properties over.
      [
        'coordinate',
        'dragging',
        'frameState',
        'map',
        'pixel',
      ].forEach((key) => {
        event[key] = olEvent[key];
      });

      this.dispatchEvent(event);
    });
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback () {
    super.connectedCallback();

    if ('ShadyCSS' in window) {
      window.ShadyCSS.styleElement(this);
    }

    // Reconnect the view.
    this.mountView_();

    // After this custom element is inserted into somewhere new, the map size has to be updated.
    // This has to be deferred because as this time the element might not get the correct styling.
    this.setTimeout(() => {
      this.olMap_.updateSize();
    });
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback () {
    super.disconnectedCallback();

    // Disconnect the view.
    this.unmountView_();
  }

  /**
   * Getters and Setters (for properties).
   */

  /**
   * @readonly
   * @property {[number, number]}
   */
  get size () {
    return [this.clientWidth, this.clientHeight];
  }

  /**
   * @readonly
   * @property {ol.Map}
   */
  get olMap () {
    return this.olMap_;
  }

  /**
   * @readonly
   * @property {Array.<HTMLMapLayerBase>}
   */
  get layerElements () {
    return this.childLayerElementsCollection_.getArray();
  }

  // @property {boolean}
  get disabled () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('disabled'));
  }
  set disabled (val) {
    if (!typeCheck('Boolean | Null', val)) {
      throw new TypeError('Disabled has to be a boolean value.');
    }

    this.flushPropertyToAttribute('disabled', val, true);
  }

  // @property {string}
  get basemap () {
    const propValFromAttr = this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('basemap'));
    return propValFromAttr === null ? defaultMapType : propValFromAttr;
  }
  set basemap (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Map view base map type has to be a string.');
    }

    const _val = typeCheck('String', val) ? val.trim() : val;

    // Update internal models.
    const layer = getBaseMap(_val, this.baseMapCache_);

    this.baseMapLayerCollection_.clear();
    if (layer === null) {
      throw new TypeError('Invalid base map type.');
    } else {
      this.baseMapLayerCollection_.push(layer);
    }
    this.baseMapLayerCollection_.changed();

    // Update attributes.
    this.flushPropertyToAttribute('basemap', _val, true);
  }

  // @property {string}
  get projection () {
    return this.mapView_.getProjection().getCode();
  }
  set projection (val) {
    if (!typeCheck('String | Null', val)) {
      throw new TypeError('Map projection has to be a string.');
    }

    if (val !== null && !this.constructor.isValidProjection(val)) {
      throw new TypeError('Invalid projection.');
    }

    // Update internal models.
    const oldVal = this.mapView_.getProjection().getCode();
    if (!this.isIdenticalPropertyValue_('projection', oldVal, val)) {
      this.updateView_({
        projection: val
      });
    }

    // Update attributes.
    this.flushPropertyToAttribute('projection', undefined, true);
  }

  // @property {[number, number]}
  get center () {
    return this.mapView_.getCenter();
  }
  set center (val) {
    if (!typeCheck('(Number, Number) | Null', val)) {
      throw new TypeError('Map view center has to be an array of 2 numbers.');
    }

    // Update internal models.
    const oldVal = this.mapView_.getCenter();
    if (!this.isIdenticalPropertyValue_('center', oldVal, val)) {
      this.mapView_.setCenter(val);
    }

    // Update attributes.
    //! Don't reflect this attribute.
    // this.flushPropertyToAttribute('center', undefined, true);
  }

  // @property {number}
  get zoom () {
    return this.mapView_.getZoom();
  }
  set zoom (val) {
    if (!typeCheck('Number | Null', val)) {
      throw new TypeError('Map view zoom has to be a number.');
    }

    // Update internal models.
    const oldVal = this.mapView_.getZoom();
    if (!this.isIdenticalPropertyValue_('zoom', oldVal, val)) {
      this.mapView_.setZoom(val);
    }

    // Update attributes.
    //! Don't reflect this attribute.
    // this.flushPropertyToAttribute('zoom', undefined, true);
  }

  /**
   * @property {[number, number, number, number]}
   */
  get extent () {
    return this.mapView_.calculateExtent(this.size);
  }
  set extent (val) {
    if (!typeCheck('(Number, Number, Number, Number) | Null', val)) {
      throw new TypeError('Map view extent has to be an array of 4 numbers.');
    }

    // Update internal models.
    this.mapView_.fit(val, {
      // `map.getSize()` is not reliable when the map is initializing.
      size: this.size,
    });

    // Update attributes.
    //! Don't reflect these attributes.
    // this.flushPropertyToAttribute('extent', undefined, true);
    // this.flushPropertyToAttribute('center');
    // this.flushPropertyToAttribute('zoom');
  }

  /**
   * Customized public/private methods.
   */

  /**
   * Update the map view with the given options.
   * @param {Object} options
   */
  updateView_ (options) {
    //! Worry about caching later.

    const finalOptions = this.olViewOptions_ = merge(this.olViewOptions_, !this.mapView_ ? null : {
      center: this.mapView_.getCenter(),
      projection: this.mapView_.getProjection().getCode(),
      rotation: this.mapView_.getRotation(),
      zoom: this.mapView_.getZoom(),
    }, options);

    const newView = new webGisComponents.ol.View(finalOptions);
    this.setView_(newView);

    if (this.connected_) {
      this.mountView_();
    }
  }

  setView_ (newView) {
    const oldView = this.mapView_;

    // These listener bindings should not be moved to a 'change:view' handler,
    // since the 'change:view' happens when the view is mounted, while these bindings
    // should happen as soon as possible to avoid side-effects.

    if (oldView) {
      // Detach listeners.
      oldView.un('change:center', this.onChangeViewExtent_);
      oldView.un('change:resolution', this.onChangeViewExtent_);
    }

    if (newView) {
      // Attach listeners.
      newView.on('change:center', this.onChangeViewExtent_);
      newView.on('change:resolution', this.onChangeViewExtent_);
    }

    this.mapView_ = newView;
  }

  onChangeViewExtent_ = () => {
    //! Don't reflect these attributes.
    // this.flushPropertyToAttribute('extent');
    // this.flushPropertyToAttribute('center');
    // this.flushPropertyToAttribute('zoom');
  }

  mountView_ () {
    this.log_('mountView_');

    this.olMap_.setView(this.mapView_);
    this.setTimeout(() => this.dispatchEvent(new Event('load:view')));
  }
  unmountView_ () {
    this.log_('unmountView_');

    this.olMap_.setView(null);
    this.setTimeout(() => this.dispatchEvent(new Event('unload:view')));
  }

  /**
   * Set the new projection and also update other related properties (e.g. coordinates).
   * @param {string} fromProj
   * @param {string} toProj
   */
  switchProjection (fromProj, toProj) {
    this.log_('switchProjection', {
      fromProj,
      toProj
    });

    const oldCenter = this.center,
          newCenter = webGisComponents.ol.proj.transform(oldCenter, fromProj, toProj);

    this.logInfo_({
      oldCenter,
      newCenter
    });

    this.projection = toProj;
    this.center = newCenter;

    // Tell children to switch projections as well.
    this.childLayerElementsCollection_.forEach((item) => item.switchProjection(fromProj, toProj));
  }

} // HTMLMapView

customElements.define(elementName, HTMLMapView);
