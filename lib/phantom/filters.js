
/**
 * Return back the page's html content.
 * @method _detector
 * @param  {Object}  result
 * @param  {String}  html
 * @return {Object}
 */
function _default(result, html) {
  return html;
}

/**
 * Return back the result given by the detector.
 * @method _detector
 * @param  {Object}  result
 * @param  {String}  html
 * @return {Object}
 */
function _detector(result, html) {
  return result;
}

module.exports = {
  'default': _default,
  'detector': _detector
};
