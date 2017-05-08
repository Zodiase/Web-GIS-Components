import createTemplate from 'helpers/createTemplate';
import templateStyle from './template.css';
import {
  elementName,
} from './config';
import templateString from './template.html';

const template = createTemplate(templateString, String(templateStyle));

if ('ShadyCSS' in window) {
  window.ShadyCSS.prepareTemplate(template, elementName);
}

export default template;
