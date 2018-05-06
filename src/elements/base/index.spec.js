import {
  expect,
} from 'chai';
import {
  spy,
} from 'sinon';

import webGisElements from 'namespace';

import HTMLMapBaseClass from './index';

describe('HTMLMapBaseClass', () => {
  describe('.transformCoord', () => {
    const transformSpy = spy();

    before(() => {
      webGisElements.setOl({
        proj: {
          transform: transformSpy,
        },
      });
    });

    after(() => {
      webGisElements.setOl();
    });

    it('should simply use `ol.proj.transform`', () => {
      expect(HTMLMapBaseClass)
        .to.have.property('transformCoord')
        .that.is.a('function');

      const input = [-90, -85];

      HTMLMapBaseClass.transformCoord(input, 'EPSG:4326', 'EPSG:3857');

      expect(transformSpy.calledWith(input, 'EPSG:4326', 'EPSG:3857')).to.be.true;
    });
  });
});
