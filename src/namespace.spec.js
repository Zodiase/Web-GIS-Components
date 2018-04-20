import {
  expect,
} from 'chai';
import sinon from 'sinon';

import webGisComponents from './namespace';

describe('webGisComponents', () => {

  it('should attach itself to window', () => {
    expect(window)
      .to.exist
      .and.have.property('webGisComponents')
      .that.equals(webGisComponents);
  });

  describe('.setOl', () => {
    it('should save the first argument, which can then be referenced at `.ol`', () => {
      expect(webGisComponents)
        .to.have.property('setOl')
        .that.is.a('function');

      const obj = {};

      webGisComponents.setOl(obj);

      expect(webGisComponents)
        .to.have.property('ol')
        .that.equals(obj);
    });
  });

  describe('.exposeComponentToGlobal', () => {

    let customElementsStub = null;
    const defineSpy = sinon.spy();

    before(() => {
      global.customElements = global.customElements || null;

      customElementsStub = sinon.stub(global, 'customElements').value({
        define: defineSpy,
      });
    });

    after(() => {
      customElementsStub.restore();
      customElementsStub = null;

      if (global.customElements === null) {
        delete global.customElements;
      }
    });

    it('should register the given component with the given tag name and attach it to window', () => {
      expect(webGisComponents)
        .to.have.property('exposeComponentToGlobal')
        .that.is.a('function');

      const component = function someName () {};
      const tagName = 'foobar';

      webGisComponents.exposeComponentToGlobal(component, tagName);

      expect(defineSpy.calledWith(tagName, component)).to.be.true;
      expect(window).to.have.property('someName').that.equals(component);
    });
  });
});
