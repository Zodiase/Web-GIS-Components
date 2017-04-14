import {
  elementName,
} from './config';
import templateString from './template.html';

const template = document.createElement('template');
template.innerHTML = templateString;

if ('ShadyCSS' in window) {
  window.ShadyCSS.prepareTemplate(template, elementName);
}

export default template;
