const {
  expect,
} = require('chai');

require('../dist/web-gis-elements.js');

describe('<map-layer-vector>', () => {
  describe('`style` property', () => {
    it('should have correct default fill color', () => {
      const element = document.createElement('map-layer-vector');

      expect(element.style).to.have.property('fill', 'none');
      expect(element.style).to.have.property('strokeColor', '#3399CC');
      expect(element.style).to.have.property('strokeWidth', 1.25);
      expect(element.style).to.have.property('vertexSize', 5);
    });

    it('should accept valid fill colors', () => {
      const element = document.createElement('map-layer-vector');

      const tests = [
        {input: 'red', output: '#FF0000'},
        {input: 'green', output: '#008000'},
        {input: 'none', output: 'none'},
        {input: '#FFF', output: '#FFFFFF'},
        {input: '#000', output: '#000000'},
        {input: 'transparent', output: 'rgba(0, 0, 0, 0)'},
        {input: 'rgb(255, 0, 0)', output: '#FF0000'},
        {input: 'rgba(0, 0, 255, 1)', output: '#0000FF'},
        {input: 'rgba(0, 0, 0, 0.5)', output: 'rgba(0, 0, 0, 0.5)'},
      ];

      tests.forEach((item) => {
        expect(item).to.satisfy(({input, output}) => {
          element.style.fill = input;
          return element.style.fill === output;
        });
      });
    });

    it('should use `none` for invalid fill colors', () => {
      const element = document.createElement('map-layer-vector');

      const tests = [
        'foo',
        '',
        'rgba(',
        'rgba(1000)',
      ];

      tests.forEach((item) => {
        expect(item).to.satisfy((input) => {
          element.style.fill = input;
          return element.style.fill === 'none';
        });
      });
    });

    it('should accept valid stroke colors', () => {
      const element = document.createElement('map-layer-vector');

      const tests = [
        {input: 'red', output: '#FF0000'},
        {input: 'green', output: '#008000'},
        {input: 'none', output: 'none'},
        {input: '#FFF', output: '#FFFFFF'},
        {input: '#000', output: '#000000'},
        {input: 'transparent', output: 'rgba(0, 0, 0, 0)'},
        {input: 'rgb(255, 0, 0)', output: '#FF0000'},
        {input: 'rgba(0, 0, 255, 1)', output: '#0000FF'},
        {input: 'rgba(0, 0, 0, 0.5)', output: 'rgba(0, 0, 0, 0.5)'},
      ];

      tests.forEach((item) => {
        expect(item).to.satisfy(({input, output}) => {
          element.style.strokeColor = input;
          return element.style.strokeColor === output;
        });
      });
    });

    it('should use `none` for invalid stroke colors', () => {
      const element = document.createElement('map-layer-vector');

      const tests = [
        'foo',
        '',
        'rgba(',
        'rgba(1000)',
      ];

      tests.forEach((item) => {
        expect(item).to.satisfy((input) => {
          element.style.strokeColor = input;
          return element.style.strokeColor === 'none';
        });
      });
    });

    it('should reflect valid fill color values to attribute', () => {
      const element = document.createElement('map-layer-vector');

      document.body.appendChild(element);

      expect(element.getAttribute('style')).to.not.exist;

      element.style.fill = 'red';
      expect(element.getAttribute('style')).to.exist.and.satisfy((styleStr) => {
        return styleStr.indexOf('fill: #FF0000') !== -1;
      });
    });
  });
});
