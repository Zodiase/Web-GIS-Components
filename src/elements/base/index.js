/**
 * Attribute change flow:
 * - attribute on change
 * - parse attribute to property
 * - if fails
 *   - error and revert attribute to the old value
 * - else
 *   - update property (with property setter, throw if error)
 *     - fill default values
 *     - verify new property
 *     - update internal models
 *     - silent update attribute with new property
 *     - dispatch change event
 *     - if canceled
 *       - revert property and attribute to the old value
 *     - else
 *       - done!
 *   - if fails
 *     - error and revert attribute to the old value
 */

/*eslint no-bitwise: "off", no-console: "off"*/
/*global HTMLElement, CustomEvent, MutationObserver*/

import webGisComponents from 'namespace';

export default class HTMLMapBaseClass extends HTMLElement {

  /**
   * Lifecycle:
   * - constructor
   * - attributeChangedCallback
   * - connectedCallback
   * - (instantiate children)
   * - [attributeChangedCallback]
   * - [disconnectedCallback]
   * - [connectedCallback]
   * - [...]
   */

  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements#Observed_attributes}
   * Child classes should extend this.
   * Attributes will be reloaded when connected in the order they appear in this list.
   * @property {Array.<string>}
   * @readonly
   * @static
   */
  static observedAttributes = [];

  /**
   * Mapping used to convert attribute names to property names.
   * Keys are attribute names.
   * Values are property names.
   * Child classes should extend this.
   * @property {Object.<string>}
   * @readonly
   * @static
   */
  static attributeNameToPropertyNameMapping = {};

  /**
   * Mapping used to convert property names to attribute names.
   * Keys are property names.
   * Values are attribute names.
   * Child classes should extend this.
   * @property {Object.<string>}
   * @readonly
   * @static
   */
  static propertyNameToAttributeNameMapping = {};

  /**
   * A map of functions for converting attribute values to property values.
   * Keys are attribute names.
   * Values are functions that convert attribute configs to property values.
   * Child classes should extend this.
   * @property {Object.<isSet: boolean, val: string -> *>}
   * @readonly
   * @static
   */
  static attributeToPropertyConverters = {};

  /**
   * A map of functions for converting property values to attribute values.
   * Keys are attribute names.
   * Values are functions that convert property values to attribute configs.
   * Child classes should extend this.
   * @property {Object.<* -> {isSet: boolean, value: string}>}
   * @readonly
   * @static
   */
  static propertyToAttributeConverters = {};

  /**
   * A map of functions for comparing two property values.
   * Keys are property names.
   * Values are functions that compare two property values and return whether they are considered identical.
   * Child classes should extend this.
   * @property {Object.<a: *, b: * -> boolean>}
   * @readonly
   * @static
   */
  static propertyComparators = {};

  /**
   * @property {Object.<a: *, b: * -> boolean>}
   * @readonly
   * @static
   */
  static commonPropertyComparators = {
    'array': (a, b) => a !== null && b !== null && a.length === b.length && a.every((x, i) => x === b[i]),
  };

  /**
   * string -> string
   * @private
   */
  static getPropertyNameByAttributeName_ (attrName) {
    return this.attributeNameToPropertyNameMapping[attrName] || attrName;
  }

  /**
   * string -> string
   * @private
   */
  static getAttributeNameByPropertyName_ (propName) {
    return this.propertyNameToAttributeNameMapping[propName] || propName;
  }

  // Attach the openlayers library.
  static get ol () {
    return webGisComponents.ol;
  }

  /**
   * A better version of transformExtent.
   * @param {ol.Extent} extent
   * @param {ol.ProjectionLike} source
   * @param {ol.ProjectionLike} destination
   * @param {number} [estimation=1] - How many interpolation points used for estimation. Must be no less than 1.
   * @returns {ol.Extent}
   */
  static transformExtent (extent, source, destination, estimation = 1) {
    // Get all four points of the rectangle instead of two.
    const [minX, minY, maxX, maxY] = extent,
          _4points = [
            [minX, minY],
            [maxX, minY],
            [maxX, maxY],
            [minX, maxY],
          ];

    const allPoints = _4points.reduce((acc, point, index, list) => {
      // Get the next point that is needed for interpolation. Wrap around when overflow.
      const nextPoint = list[(index + 1) % list.length];
      // Get the axis where interpolation is needed. The input values are arranged so the interpolation axis iterates between 1 and 0.
      const interpolateAxis = index % 2;

      const val1 = point[interpolateAxis],
            val2 = nextPoint[interpolateAxis],
            valDiff = val2 - val1,
            pointPerEdge = estimation + 2,
            valStep = valDiff / (pointPerEdge - 1);

      const points = [];
      for (let i = 1; i <= estimation; ++i) {
        const thisPoint = [...point];
        thisPoint[interpolateAxis] = val1 + valStep * i;

        points.push(thisPoint);
      }

      return [...acc, point, ...points];
    }, []);

    const allPointsInDestination = allPoints.map((point) => webGisComponents.ol.proj.transform(point, source, destination));

    // The source data used for aggregation has to contain the head again in the end to prevent overflow.
    const aggSrcData = [...allPointsInDestination, allPointsInDestination[0]];

    const aggFuncs = [
      Math.min.bind(Math),
      Math.max.bind(Math),
    ];

    const aggConfig = [
      // Order is important. It must match how `_4points` is defined.
      // For example, if `_4points[0]` and `_4points[1]` share the same Y, then the first one here must be a Y.
      'minY',
      'maxX',
      'maxY',
      'minX',
    ].map((name, index) => [name, {
      // As long as the name string array follows the order of `_4points`, these two properties don't depend on the name values.
      edgeBegin: (estimation + 1) * index,
      edgeEnd: (estimation + 1) * (index + 1) + 1,
      // This should work for the exact name value arrangement.
      // Axis X is 0, Y is 1.
      axis: 1 - index % 2,
      // This should work for the exact name value arrangement and the aggregation function arrangement.
      func: aggFuncs[(index >> 1) ^ (index & 1)]
    }]).reduce((acc, [name, config]) => ({
      ...acc,
      [name]: config
    }), {});

    const result = [
      // Result must be in the order of: minX, minY, maxX, maxY.
      aggConfig.minX,
      aggConfig.minY,
      aggConfig.maxX,
      aggConfig.maxY,
    ].map(({func, axis, edgeBegin, edgeEnd}) => func(...(aggSrcData.slice(edgeBegin, edgeEnd).map((point) => point[axis]))));

    return result;
  }

  /**
   * Returns true if the given value is a valid projection.
   * @param {ol.ProjectionLike} val
   * @returns {boolean}
   */
  static isValidProjection (val) {
    return webGisComponents.ol.proj.get(val) !== null;
  }

  /**
   * NodeList -> Array.<Node>
   */
  static getArrayFromNodeList (nodeList) {
    return Array.from(nodeList);
  }

  /**
   * Returns a collection of the child elements of the specified type.
   * The collection is auto-updated until `.disconnect()` is called.
   * Does it potentially leak observers?
   * @param {HTMLElement} element
   * @param {function} constructor
   * @returns {ol.Collection.<function>}
   */
  static getLiveChildElementCollection (element, constructor) {
    const collection = new webGisComponents.ol.Collection(),
          updateFunction = this.updateChildElements_.bind(this, element, constructor, collection),
          observer = new MutationObserver(updateFunction);

    // Start observing.
    observer.observe(element, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });

    // If there is already children in the element, we need another pass of updating.
    if (element.children.length > 0) {
      setTimeout(updateFunction, 0);
    }

    // Attach a function to stop the observer.
    collection.disconnect = () => {
      observer.disconnect();
    };

    return collection;
  }

  /**
   * Scan the children for the given elements.
   * @private
   * @param {HTMLElement} element
   * @param {function} constructor
   * @param {ol.Collection} collection
   */
  static updateChildElements_ (element, constructor, collection) {
    const childElements = this.getArrayFromNodeList(element.children).filter((node) => node instanceof HTMLElement);

    // Only scan one level. The elements in this level should handle their own children.
    const targetElements = childElements.filter((node) => node instanceof constructor);

    // Do nothing if the new elements are identical to the existing ones.
    const oldTargetElements = collection.getArray(),
          equalToOldList = targetElements.length === oldTargetElements.length && targetElements.every((el, index) => el === oldTargetElements[index]);
    if (equalToOldList) {
      return;
    }

    // Update collection.
    collection.clear();
    collection.extend(targetElements);
    collection.changed();

    element.log_(`${targetElements.length} layer(s) loaded from ${childElements.length} element(s).`);
  }

  /**
   * An instance of the element is created or upgraded.
   * Useful for initializing state, settings up event listeners, or creating shadow dom.
   * See the spec for restrictions on what you can do in the constructor.
   */
  constructor () {
    super(); // always call super() first in the ctor.

    // `this` is the container HTMLElement.
    // It has no attributes or children at construction time.

    // Indicate whether this custom element is in DOM or not.
    this.connected_ = false;

    // Special flag to suppress `attributeChangedCallback`.
    this.ignoreAttributeChanges_ = true;

    this.initAttributeUpdateFlagging_();

    // This namespace stores flags indicating if the old values of some attributes were working.
    this.hasWorkingAttributes_ = {};

    this.initTimeoutIdCollection_();

    // Setup logging functions.
    if (VERBOSE) {
      this.log_ = console.log.bind(console, `${this.constructor.name}_${this.id}`);
      this.logInfo_ = console.info.bind(console, `${this.constructor.name}_${this.id}`);
    } else {
      this.log_ = this.logInfo_ = () => { /*NOOP*/ };
    }
    this.logWarn_ = console.warn.bind(console, `${this.constructor.name}_${this.id}`);
    this.logError_ = console.error.bind(console, `${this.constructor.name}_${this.id}`);
  } // constructor

  /**
   * Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
   */
  connectedCallback () {
    this.ignoreAttributeChanges_ = false;

    this.constructor.observedAttributes.forEach((attrName) => this.hasAttribute(attrName) && this.reloadAttribute(attrName));

    this.connected_ = true;

    this.log_('connected', {
      attributes: [...this.attributes],
    });
  }

  /**
   * Called every time the element is removed from the DOM. Useful for running clean up code (removing event listeners, etc.).
   */
  disconnectedCallback () {
    this.log_('disconnected');

    // Clear all timers.
    this.forEachTimeoutId_((id) => {
      this.clearTimeout(id);
    });

    this.connected_ = false;
    this.ignoreAttributeChanges_ = true;
  }

  /**
   * An attribute was added, removed, updated, or replaced.
   * Also called for initial values when an element is created by the parser, or upgraded.
   * If the change is successful, a bubbling change event is fired on the element.
   * Note: only attributes listed in the static `observedAttributes` property will receive this callback.
   */
  attributeChangedCallback (attrName, oldVal, newVal) {
    if (this.ignoreAttributeChanges_) {
      return;
    }

    this.log_('attributeChangedCallback', {
      attrName,
      oldVal,
      newVal
    });

    // If this attribute is already being updated, do not trigger a reaction again.
    if (this.isAttributeFlaggedAsBeingUpdated_(attrName)) {
      this.log_('attributeChangedCallback', attrName, 'attribute update in progress');
      return;
    }

    try {
      this.log_('attributeChangedCallback', attrName, 'attribute begin update');
      // Mark the attribute as being updated so changing its value during the process doesn't cause another reaction (and dead loop).
      this.flagAttributeAsBeingUpdated_(attrName);

      const propName = this.constructor.getPropertyNameByAttributeName_(attrName),
            oldPropVal = this.getPropertyValueFromAttribute_(attrName, oldVal !== null, oldVal), //this[propName],
            newPropVal = this.getPropertyValueFromAttribute_(attrName, newVal !== null, newVal);

      if (this.isIdenticalPropertyValue_(propName, oldPropVal, newPropVal)) {
        this.log_(propName, 'no change');
      } else {
        // Setter should verify new property value and throw if needed.
        // Setter also fires the change event and throws if the event is canceled.
        this[propName] = newPropVal;

        // No error and not cancelled.
        this.hasWorkingAttributes_[attrName] = true;

        this.log_(propName, 'changed', {
          oldVal: oldPropVal,
          newVal: newPropVal
        });
      }
    } catch (error) {
      const cancelled = error.message === 'cancel';

      if (!cancelled) {
        this.logError_(`Failed to handle attribute change. ${error.message}`, {
          attrName,
          oldVal,
          newVal
        });
      }

      // Either cancelled or errored.
      if (this.hasWorkingAttributes_[attrName]) {
        // Revert the attribute to the old value.
        if (oldVal === null) {
          this.removeAttribute(attrName);
        } else {
          this.setAttribute(attrName, oldVal);
        }
      } else {
        this.logWarn_('No acceptable value to revert to.', {
          attrName,
          oldVal,
          newVal
        });
      }
    } finally {
      this.unflagAttributeAsBeingUpdated_(attrName);
    }
  } // attributeChangedCallback

  /**
   * The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
   */
  adoptedCallback () {
    // TODO: Do something?
  }

  get connected () {
    return this.connected_;
  }

  // Attach the openlayers library.
  get ol () {
    return webGisComponents.ol;
  }

  /************************************************************************************************
   * Property/Attribute methods.
   ***********************************************************************************************/

  /**
   * Helper for triggering an attribute change manually.
   * @param  {string} attrName
   */
  reloadAttribute (attrName) {
    this.attributeChangedCallback(attrName, null, this.getAttribute(attrName));
  }

  /**
   * Compare two values of the property.
   * If a comparator is defined for this property, it is used.
   * Otherwise, strict value (`===`) comparison is used.
   * string, *, * -> boolean
   * @private
   */
  isIdenticalPropertyValue_ (propName, val1, val2) {
    let comparator = this.constructor.propertyComparators[propName];

    if (typeof comparator === 'string') {
      const comparatorName = comparator;

      comparator = this.constructor.commonPropertyComparators[comparatorName];

      if (!comparator) {
        this.logWarn_(`Unknown comparator ${comparatorName}`);
      }
    }

    if (comparator) {
      return comparator(val1, val2);
    } else {
      return val1 === val2;
    }
  }

  /**
   * Convert an attribute value to a property value.
   * For example, attribute values are typically strings, while a property could be a number or an array.
   * If a converter is defined for this attribute, it is used.
   * Otherwise, the raw value of the attribute is returned, if the attribute is present.
   * If the attribute is not present, returns `null`.
   * @private
   * @param {string} attrName
   * @param {boolean} [hasAttr] - Optional. If provided, will use this value for conversion.
   * @param {string} [attrVal] - Optional. If provided, will use this value for conversion.
   * @returns {*}
   */
  getPropertyValueFromAttribute_ (
    attrName,
    hasAttr = this.hasAttribute(attrName),
    attrVal = this.getAttribute(attrName),
  ) {
    if (!hasAttr) {
      return null;
    } else {
      const converter = this.constructor.attributeToPropertyConverters[attrName];

      if (converter) {
        return converter(hasAttr, attrVal);
      } else {
        return attrVal;
      }
    }
  }

  /**
   * Convert a property value to an attribute value and set the attribute.
   * If a converter is defined for this property, it is used.
   * Otherwise, if the value is `null`, the attribute is removed.
   * Otherwise the String form of the value is used to set the attribute.
   * @private
   * @param {string} attrName
   * @param {*} propVal
   */
  updateAttributeByProperty_ (attrName, propVal) {
    const converter = this.constructor.propertyToAttributeConverters[attrName];

    if (converter) {
      const {
        isSet,
        value
      } = converter(propVal);

      if (isSet) {
        this.setAttribute(attrName, value);
      } else {
        this.removeAttribute(attrName);
      }
    } else if (propVal === null) {
      this.removeAttribute(attrName);
    } else {
      this.setAttribute(attrName, String(propVal));
    }
  }

  /**
   * Helper function to make `updateAttributeByProperty_` easier to use.
   * This function will not trigger `attributeChangedCallback`.
   * @param  {string} propName
   * @param  {*} propVal
   * @param  {bool} forced
   */
  flushPropertyToAttribute (propName, propVal = this[propName], forced = false) {
    const attrName = this.constructor.getAttributeNameByPropertyName_(propName);

    if (this.hasAttribute(attrName) || forced) {
      this.flagAttributeAsBeingUpdated_(attrName);
      this.updateAttributeByProperty_(attrName, propVal);
      this.unflagAttributeAsBeingUpdated_(attrName);
    }
  }

  /************************************************************************************************
   * Helpers for getting/setting/clearing update flags.
   ***********************************************************************************************/

  // @private
  initAttributeUpdateFlagging_ () {
    // This namespace stores flags indicating what attributes are being changed.
    this.changingAttributes_ = {};
  }

  /**
   * Mark an attribute as being updated so the attribute monitor would not
   * react to the changes to that attribute.
   * Use intergers to avoid race conditions between multiple locking sessions.
   * @param {string} attrName
   * @private
   */
  flagAttributeAsBeingUpdated_ (attrName) {
    if (attrName in this.changingAttributes_) {
      this.changingAttributes_[attrName] += 1;
    } else {
      this.changingAttributes_[attrName] = 1;
    }
  }
  /**
   * Undo the action of `flagAttributeAsBeingUpdated_`.
   * @param {string} attrName
   * @private
   */
  unflagAttributeAsBeingUpdated_ (attrName) {
    if (!(attrName in this.changingAttributes_)) {
      return;
    }

    this.changingAttributes_[attrName] -= 1;

    if (this.changingAttributes_[attrName] <= 0) {
      delete this.changingAttributes_[attrName];
    }
  }
  // @private
  isAttributeFlaggedAsBeingUpdated_ (attrName) {
    return (attrName in this.changingAttributes_) &&
      this.changingAttributes_[attrName] > 0;
  }

  /************************************************************************************************
   * Helper functions for manipulating internal storage for `setTimeout`.
   ***********************************************************************************************/

  // @private
  initTimeoutIdCollection_ () {
    this.timeoutIDs_ = new Set();
  }

  // @private
  addTimeoutId_ (id) {
    return this.timeoutIDs_.add(id);
  }
  // @private
  removeTimeoutId_ (id) {
    return this.timeoutIDs_.delete(id);
  }

  /**
   * Helper function for iterating internal storage for `setTimeout`.
   * @param {function} func
   * @param {Object|null} context
   */
  forEachTimeoutId_ (func, context) {
    this.timeoutIDs_.forEach(func, context);
  }

  /**
   * `global.setTimeout` wrapped for safety.
   * The timeouts registered with this will all be cancelled if the element is disconnected.
   * @param {function} func
   * @param {number} [delay=0]
   * @param {Array.<*>} [params]
   * @returns {number}
   */
  setTimeout (func, delay = 0, ...params) {
    const timerID = setTimeout((..._params) => {

      this.removeTimeoutId_(timerID);

      func(..._params);

    }, delay, ...params);

    this.addTimeoutId_(timerID);

    return timerID;
  }

  /**
   * `global.clearTimeout` wrapped for safety.
   * Does the reverse of `this.setTimeout`.
   * @param {number} timerID
   */
  clearTimeout (timerID) {
    clearTimeout(timerID);

    this.removeTimeoutId_(timerID);
  }

  /**
   * Instance level helper for the static method with the same name.
   */
  getLiveChildElementCollection (constructor) {
    return this.constructor.getLiveChildElementCollection(this, constructor);
  }

} // HTMLMapBaseClass
