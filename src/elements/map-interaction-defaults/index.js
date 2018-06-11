import webGisElements from 'namespace';

import HTMLMapInteractionBase from '../map-interaction-base';

import {
  elementName,
} from './config';

/**
 * Usage:
 * <HTMLMapDefaultInteractions></HTMLMapDefaultInteractions>
 */
export default class HTMLMapDefaultInteractions extends HTMLMapInteractionBase {

  constructor () {
    super();

    this.olInteractions_.extend(webGisElements.ol.interaction.defaults({}).getArray());
  }

} // HTMLMapDefaultInteractions

webGisElements.exposeComponentToGlobal(HTMLMapDefaultInteractions, elementName);
