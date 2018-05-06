const {
  expect,
} = require('chai');

const requiredModule = require('../dist/web-gis-elements.js');

describe('Module', () => {
  it('currently has nothing', () => {
    expect(Object.keys(requiredModule)).to.have.length(0);
  });
});
