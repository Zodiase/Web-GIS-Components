import webGisComponents from 'namespace';

import BaseClass from '../map-interaction-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultInteractions></HTMLMapDefaultInteractions>
 */
export default class HTMLMapDefaultInteractions extends BaseClass {

  constructor () {
    super();

    this.olInteractions_.extend(webGisComponents.ol.interaction.defaults({}).getArray());
  }

} // HTMLMapDefaultInteractions

customElements.define(elementName, HTMLMapDefaultInteractions);
