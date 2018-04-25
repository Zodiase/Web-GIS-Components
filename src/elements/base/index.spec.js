import {
  expect,
} from 'chai';
import {
  spy,
} from 'sinon';

import webGisComponents from 'namespace';

import HTMLMapBaseClass from './index';

describe('HTMLMapBaseClass', () => {
  describe('.transformCoord', () => {
    const transformSpy = spy();

    before(() => {
      webGisComponents.setOl({
        proj: {
          transform: transformSpy,
        },
      });
    });

    after(() => {
      webGisComponents.setOl();
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
