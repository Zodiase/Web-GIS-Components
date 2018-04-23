const {
  expect,
} = require('chai');

require('../dist/web-gis-components.js');

describe('<map-layer-vector>', () => {
  describe('`style` property', () => {

    it('should have correct default fill color', () => {
      const element = document.createElement('map-layer-vector');

      expect(element.style).to.have.property('fill').that.equals('none');
    });

    it('should accept valid fill colors', () => {
      const element = document.createElement('map-layer-vector');

      element.style.fill = 'red';
      expect(element.style).to.have.property('fill').that.equals('red');
      element.style.fill = 'green';
      expect(element.style).to.have.property('fill').that.equals('green');
      element.style.fill = '';
      expect(element.style).to.have.property('fill').that.equals('none');
    });
  });
});
