import {
  expect,
} from 'chai';

import * as customElementHelpers from './custom-element-helpers';

describe('customElementHelpers', () => {
  describe('.commonAttributeToPropertyConverters', () => {
    describe('.bool', () => {
      it('should return true when the attribute is set', () => {
        expect(customElementHelpers)
          .to.have.property('commonAttributeToPropertyConverters')
          .that.has.property('bool')
          .that.is.a('function')
          .and.satisfies((func) => func(true) === true);
      });
      it('should return false when the attribute is not set', () => {
        expect(customElementHelpers)
          .to.have.property('commonAttributeToPropertyConverters')
          .that.has.property('bool')
          .that.is.a('function')
          .and.satisfies((func) => func(false) === false);
      });
    });
    describe('.string', () => {
      it('should return trimmed value when the attribute is set', () => {
        expect(customElementHelpers)
          .to.have.property('commonAttributeToPropertyConverters')
          .that.has.property('string')
          .that.is.a('function')
          .and.satisfies((func) => func(true, ' foobar ') === 'foobar');
      });
      it('should return `null` when the attribute is not set', () => {
        expect(customElementHelpers)
          .to.have.property('commonAttributeToPropertyConverters')
          .that.has.property('string')
          .that.is.a('function')
          .and.satisfies((func) => func(false) === null);
      });
    });
  });
});
