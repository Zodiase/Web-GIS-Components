import templateStyle from './template.css';
const templateStyleString = String(templateStyle);
const style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
  style.styleSheet.cssText = templateStyleString;
} else {
  style.appendChild(document.createTextNode(templateStyleString));
}

import {
  elementName,
} from './config';
import templateString from './template.html';

const template = document.createElement('template');
template.innerHTML = templateString;
template.content.insertBefore(style, template.content.childNodes[0]);

if ('ShadyCSS' in window) {
  window.ShadyCSS.prepareTemplate(template, elementName);
}

export default template;
