import createTemplate from 'helpers/createTemplate';
import templateStyle from './template.less';
import {
  olControlElementName,
} from './config';
import templateString from './template.html';

const template = createTemplate(templateString, String(templateStyle));

template.name = olControlElementName;

if ('ShadyCSS' in window) {
  window.ShadyCSS.prepareTemplate(template, olControlElementName);
}

export default template;
