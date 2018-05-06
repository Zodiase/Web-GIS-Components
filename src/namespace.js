// Define the namespace for this library.
const webGisElements = {
  setOl (newOl) {
    this.ol = newOl;
  },
  // Reference the Openlayers in global if possible.
  ol: window.ol || null,
  /**
   * Helper function for exposing a component class to global.
   * @param {Function} component
   * @param {string} tagName
   */
  exposeComponentToGlobal (component, tagName) {
    const componentName = component.name;

    customElements.define(tagName, component);

    Object.defineProperty(window, componentName, {
      configurable: false,
      enumerable: false,
      value: component,
      writable: false,
    });
  },
};

if (!window.webGisElements) {
  // Attach it to global.
  Object.defineProperty(window, 'webGisElements', {
    configurable: false,
    enumerable: false,
    value: webGisElements,
    writable: false,
  });
}

export default webGisElements;
