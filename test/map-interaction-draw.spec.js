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

  describe('`type` property', () => {
    it('should have correct default value', () => {
      const element = document.createElement('map-interaction-draw');

      expect(element).to.have.property('type', 'Polygon');
    });

    it('should accept valid values', () => {
      const element = document.createElement('map-interaction-draw');

      element.type = 'Point';
      expect(element).to.have.property('type', 'Point');

      element.type = 'LineString';
      expect(element).to.have.property('type', 'LineString');

      element.type = 'Polygon';
      expect(element).to.have.property('type', 'Polygon');

      element.type = 'MultiPoint';
      expect(element).to.have.property('type', 'MultiPoint');

      element.type = 'MultiLineString';
      expect(element).to.have.property('type', 'MultiLineString');

      element.type = 'MultiPolygon';
      expect(element).to.have.property('type', 'MultiPolygon');

      element.type = 'Circle';
      expect(element).to.have.property('type', 'Circle');

      element.type = 'Box';
      expect(element).to.have.property('type', 'Box');
    });

    it('should not cause left-over geometry function after switching to `Box`', () => {
      const element = document.createElement('map-interaction-draw');

      // Unfortunately this test requires accessing a private property.

      expect(element).to.have.property('olInteractionOptions_')
        .that.does.not.have.property('geometryFunction');

      element.type = 'Box';
      expect(element).to.have.property('olInteractionOptions_')
        .that.has.property('geometryFunction')
        .that.is.a('function');
      
      element.type = 'Point';
      expect(element).to.have.property('olInteractionOptions_')
        .that.does.not.have.property('geometryFunction');
    });
  });
});
