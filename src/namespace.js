// Define the namespace for this library.
const webGisComponents = {
  setOl (newOl) {
    this.ol = newOl;
  },
  // Reference the Openlayers in global if possible.
  ol: window.ol || null,
};

// Attach it to global.
window.webGisComponents = webGisComponents;

export default webGisComponents;
