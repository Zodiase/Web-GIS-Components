const {
  expect,
} = require('chai');
const {
  defer,
} = require('lodash');
const {
  spy,
  stub,
} = require('sinon');

require('../dist/web-gis-elements.js');

const createNewElement = () => document.createElement('map-control-simple-layer-list');
const delay = (ms = 0) => new Promise((resolve) => defer(resolve, ms));

describe('<map-control-simple-layer-list>', () => {

  it('can be created', () => {
    expect(createNewElement).to.not.throw();
  });

  it('has a list of control objects', () => {
    const element = createNewElement();

    expect(element).to.have.property('controls')
      .that.is.an('array').that.is.not.empty;
  });

  it('should be assigned a new map element when moved (to a new map view)', async () => {
    const element = createNewElement();
    const mapView = document.createElement('map-view');
    const mapElementSetterSpy = spy();

    stub(element, 'mapElement').set(mapElementSetterSpy);

    mapView.appendChild(element);
    // mapElement is set async.
    expect(mapElementSetterSpy.called).to.be.false;
    await delay();
    expect(mapElementSetterSpy.calledWith(mapView)).to.be.true;
  });

  it('can be moved to different map views', async () => {
    const element = createNewElement();
    const mapView1 = document.createElement('map-view');
    const mapView2 = document.createElement('map-view');

    element.controls.forEach((control) => {
      expect(control).to.have.property('getMap')
        .that.is.a('function');
      expect(control.getMap()).to.be.null;
    });

    mapView1.appendChild(element);
    // mapElement is set async.
    element.controls.forEach((control) => {
      expect(control).to.have.property('getMap')
        .that.is.a('function');
      expect(control.getMap()).to.be.null;
    });
    await delay();
    element.controls.forEach((control) => {
      expect(control).to.have.property('getMap')
        .that.is.a('function');
      expect(control.getMap()).to.equal(mapView1.olMap);
    });

    mapView2.appendChild(element);
    element.controls.forEach((control) => {
      expect(control).to.have.property('getMap')
        .that.is.a('function');
      expect(control.getMap()).to.equal(mapView1.olMap);
    });
    await delay();
    element.controls.forEach((control) => {
      expect(control).to.have.property('getMap')
        .that.is.a('function');
      expect(control.getMap()).to.equal(mapView2.olMap);
    });
  });

});
