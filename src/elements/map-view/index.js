import {
  concat,
  merge,
} from 'lodash.local';
import {
  typeCheck
} from 'type-check';

import webGisElements from 'namespace';
import {
  commonAttributeToPropertyConverters,
  createBooleanPropertyToAttributeConverter,
  commonPropertyToAttributeConverters,
  commonPropertyComparators,
} from 'helpers/custom-element-helpers';

import HTMLMapBaseClass from '../base';
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

export default class HTMLMapView extends HTMLMapBaseClass {

  // @override
  static observedAttributes = concat(HTMLMapBaseClass.observedAttributes, [
    'disabled',
    'basemap',
    'projection',
    'extent',
    'center',
    'zoom',
  ]);

  // @override
  static attributeToPropertyConverters = merge({}, HTMLMapBaseClass.attributeToPropertyConverters, {
    'disabled': commonAttributeToPropertyConverters.bool,
    'basemap': commonAttributeToPropertyConverters.string,
    'projection': commonAttributeToPropertyConverters.string,
    'center': commonAttributeToPropertyConverters.array_number,
    'zoom': commonAttributeToPropertyConverters.number,
    'extent': commonAttributeToPropertyConverters.array_number,
  });

  // @override
  static propertyToAttributeConverters = merge({}, HTMLMapBaseClass.propertyToAttributeConverters, {
    'disabled': createBooleanPropertyToAttributeConverter('disabled'),
    'center': commonPropertyToAttributeConverters.array_simple,
  });

  // @override
  static propertyComparators = merge({}, HTMLMapBaseClass.propertyComparators, {
    'center': commonPropertyComparators.array,
    'extent': commonPropertyComparators.array,
  });

  constructor () {
    super();

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
    this.mapControlCollection_ = new webGisElements.ol.Collection();

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
    this.mapOverlays_ = new webGisElements.ol.Collection();

    /**
     * Interactions are tied to the map view.
     * Modify its content but don't reassign it.
     * @type {ol.Collection.<ol.interaction.Interaction>}
     */
    this.mapInteractionCollection_ = new webGisElements.ol.Collection();
    /**
     * This is a collection for monitoring collections of interactions.
     * An interaction element can have a collection of interactions associated with it.
     * And the content of that collection could change.
     * So we need to monitor each one of those collections.
     * And release the event listeners when the element is removed.
     * @type {ol.Collection.<HTMLMapInteractionBase>}
     */
    this.trackedInteractionElementCollection_ = new webGisElements.ol.Collection();

    // When tracked interaction elements change, reload interactions from them into `this.mapInteractionCollection_`.
    this.trackedInteractionElementCollection_.on('change', ({target}) => {
      this.mapInteractionCollection_.clear();

      target.forEach((interactionElement) => {
        this.mapInteractionCollection_.extend(interactionElement.interactions.getArray());
      });

      this.mapInteractionCollection_.changed();

      this.dispatchEvent(new Event('change:interactions'));
    });

    // Interaction Elements in this map view.
    // @type {ol.Collection.<HTMLMapInteractionBase>}
    this.mapInteractionElementCollection_ = this.getLiveChildElementCollection(HTMLMapInteractionBase);

    // When the child interaction elements change, load them into the tracked collection `this.trackedInteractionElementCollection_`.
    this.mapInteractionElementCollection_.on('change', ({target}) => {
      // Release currently tracked elements.
      const trackedInteractionElements = this.trackedInteractionElementCollection_.getArray();

      trackedInteractionElements.forEach((interactionElement) => {
        interactionElement.interactions.un('change', this.onChangeInteractionElementInteractions_);
      });

      this.trackedInteractionElementCollection_.clear();

      const newInteractionElements = target.getArray();

      // Track new elements.
      newInteractionElements.forEach((interactionElement) => {
        interactionElement.interactions.on('change', this.onChangeInteractionElementInteractions_);
      });

      this.trackedInteractionElementCollection_.extend(newInteractionElements);

      this.trackedInteractionElementCollection_.changed();
    });

    // This collection holds the child layers so it's easier to do batch updates.
    // @type {ol.Collection.<ol.layer.Base>}
    this.childMapLayerCollection_ = new webGisElements.ol.Collection();

    // This collection holds the child layer elements.
    // @type {ol.Collection.<HTMLMapLayerBase>}
    this.childLayerElementsCollection_ = HTMLMapLayerGroup.getLiveChildLayerElementCollection(this, this.childMapLayerCollection_);

    this.childLayerElementsCollection_.on('change', (/*{type, target}*/) => {
      this.dispatchEvent(new Event('change:layers'));
    });

    // This stores the current base map name.
    // @type {string}
    this.baseMapName_ = defaultMapType;
    // This collection holds the base map.
    this.baseMapLayerCollection_ = new webGisElements.ol.Collection([
      getBaseMap(this.baseMapName_, this.baseMapCache_)
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

    this.olMap_ = new webGisElements.ol.Map({
      controls: this.mapControlCollection_,
      interactions: this.mapInteractionCollection_,
      keyboardEventTarget: this.mapElement_,
      layers: [
        new webGisElements.ol.layer.Group({
          opacity: 1,
          visible: 1,
          //extent:
          zIndex: 0,
          layers: this.baseMapLayerCollection_
        }),
        new webGisElements.ol.layer.Group({
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
      event.latLongCoordinate = this.constructor.transformCoord(olEvent.coordinate, this.projection, this.constructor.IOProjection);

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

  /**
   * This is a reflected property.
   * @property {boolean}
   */
  get disabled () {
    return this.getPropertyValueFromAttribute_(this.constructor.getAttributeNameByPropertyName_('disabled'));
  }
  set disabled (val) {
    const oldValue = this.disabled;
    const newValue = val === null ? null : Boolean(val);

    this.flushPropertyToAttribute('disabled', val, true);

    const event = new CustomEvent('change:disabled', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'disabled',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * Setting an invalid property value silently fails.
   * @property {string}
   */
  get basemap () {
    return this.baseMapName_;
  }
  set basemap (val) {
    const oldValue = this.basemap;

    this.baseMapName_ = defaultMapType;
    this.baseMapLayerCollection_.clear();

    if (val === null) {
      return;
    }

    const layer = getBaseMap(val, this.baseMapCache_);

    if (layer === null) {
      return;
    }

    // Update internal models.
    this.baseMapName_ = layer.name;
    this.baseMapLayerCollection_.push(layer);
    this.baseMapLayerCollection_.changed();

    const event = new CustomEvent('change:basemap', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'basemap',
        oldValue: oldValue,
        newValue: this.baseMapName_,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * Setting an invalid property value silently fails.
   * @property {string}
   */
  get projection () {
    return this.mapView_.getProjection().getCode();
  }
  set projection (val) {
    const oldValue = this.projection;
    let newValue = val === null ? null : String(val);

    if (newValue !== null && !this.constructor.isValidProjection(newValue)) {
      newValue = defaultViewProjection;
    }

    // Update internal models.
    if (this.isIdenticalPropertyValue_('projection', oldValue, newValue)) {
      return;
    }

    this.updateView_({
      projection: newValue,
    });

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

  /**
   * This is not a reflected property.
   * The value should be in longitude and latitude.
   * @property {[number, number]}
   */
  get center () {
    const rawCoord = this.mapView_.getCenter();
    const centerInLatLong = this.constructor.transformCoord(rawCoord, this.projection, this.constructor.IOProjection);

    return centerInLatLong;
  }
  set center (val) {
    if (!typeCheck('(Number, Number) | Null', val)) {
      throw new TypeError('Map view center has to be an array of 2 numbers.');
    }

    // Update internal models.
    const oldValue = this.center;
    const newValue = val;

    if (this.isIdenticalPropertyValue_('center', oldValue, newValue)) {
      return;
    }

    const projectedCenter = this.constructor.transformCoord(newValue, this.constructor.IOProjection, this.projection);

    this.mapView_.setCenter(projectedCenter);

    const event = new CustomEvent('change:center', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'center',
        oldValue,
        newValue,
        projectedCenter,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {number}
   */
  get zoom () {
    return this.mapView_.getZoom();
  }
  set zoom (val) {
    const oldValue = this.zoom;
    // `null` turns into 0.
    const newValue = Number(val);
    // TODO: handle when `newValue` is `NaN`.

    // Update internal models.
    if (this.isIdenticalPropertyValue_('zoom', oldValue, newValue)) {
      return;
    }

    this.mapView_.setZoom(newValue);

    const event = new CustomEvent('change:zoom', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'zoom',
        oldValue,
        newValue,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * This is not a reflected property.
   * @property {[number, number, number, number]}
   */
  get extent () {
    const rawExtent = this.mapView_.calculateExtent(this.size);
    const extentInLatLong = this.constructor.transformExtent(rawExtent, this.projection, this.constructor.IOProjection);

    return extentInLatLong;
  }
  set extent (val) {
    if (!typeCheck('(Number, Number, Number, Number) | Null', val)) {
      throw new TypeError('Map view extent has to be an array of 4 numbers.');
    }

    // Update internal models.
    const oldValue = this.extent;
    const newValue = val;

    if (this.isIdenticalPropertyValue_('extent', oldValue, newValue)) {
      return;
    }

    const projectedExtent = this.constructor.transformExtent(newValue, this.constructor.IOProjection, this.projection);

    this.mapView_.fit(projectedExtent, {
      // `map.getSize()` is not reliable when the map is initializing.
      size: this.size,
    });

    const event = new CustomEvent('change:extent', {
      bubbles: true,
      // TODO: Make this cancelable.
      cancelable: false,
      scoped: false,
      composed: false,
      detail: {
        property: 'extent',
        oldValue,
        newValue,
        projectedExtent,
      },
    });

    this.dispatchEvent(event);
  }

  /**
   * Customized public/private methods.
   */

  /**
   * Update the map view with the given options.
   * @param {Object} options
   */
  updateView_ (options) {
    // TODO: Use caching.

    const finalOptions = this.olViewOptions_ = merge(this.olViewOptions_, !this.mapView_ ? null : {
      center: this.mapView_.getCenter(),
      projection: this.mapView_.getProjection().getCode(),
      rotation: this.mapView_.getRotation(),
      zoom: this.mapView_.getZoom(),
    }, options);

    const newView = new webGisElements.ol.View(finalOptions);

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

  onChangeViewExtent_ = (olEvent) => {
    const event = new CustomEvent('change:extent', {
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

    const oldCenter = this.center;

    this.projection = toProj;
    this.center = oldCenter;

    // Tell children to switch projections as well.
    this.childLayerElementsCollection_.forEach((item) => item.switchProjection(fromProj, toProj));
  }

  // Callback when the interactions in an interaction element change.
  onChangeInteractionElementInteractions_ = () => {
    // Reload interactions from all tracked interaction elements.
    this.trackedInteractionElementCollection_.changed();
  };

} // HTMLMapView

webGisElements.exposeComponentToGlobal(HTMLMapView, elementName);
