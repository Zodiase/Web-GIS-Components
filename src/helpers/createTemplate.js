/**
 * Creates a new Template element with the provided html string.
 * Optionally takes in a CSS string and adds it to the template.
 * @param {string} htmlStr
 * @param {string} [cssStr]
 * @return {HTMLTemplateElement}
 */
export default (htmlStr, cssStr = '') => {
  const template = document.createElement('template');

  template.innerHTML = htmlStr;

  if (cssStr) {
    const style = document.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = cssStr;
    } else {
      style.appendChild(document.createTextNode(cssStr));
    }

    template.content.insertBefore(style, template.content.childNodes[0]);
  }

  return template;
};
