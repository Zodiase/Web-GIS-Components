const {
  expect,
} = require('chai');

require('../dist/web-gis-elements.js');

describe('<map-interaction-draw>', () => {
  describe('`freehand` property', () => {
    it('should have correct default value', () => {
      const element = document.createElement('map-interaction-draw');

      expect(element).to.have.property('freehand', null);
    });

    it('should take any input as boolean values', () => {
      const element = document.createElement('map-interaction-draw');

      document.body.appendChild(element);

      expect(element).to.have.property('freehand', null);

      element.freehand = true;
      expect(element).to.have.property('freehand', true);

      element.freehand = false;
      expect(element).to.have.property('freehand', null);

      element.freehand = 'foo';
      expect(element).to.have.property('freehand', true);

      element.freehand = null;
      expect(element).to.have.property('freehand', null);
    });
  });
});
