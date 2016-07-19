/**
 * Sophia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-sophia/)
 *
 * Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
 *
 * @link      http://github.com/itmcdev/nodejs-sophia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-sophia/LICENSE MIT License
 */

import Logger from './Logger';

/**
 *
 */
export class Sophia {

  /**
   * [constructor description]
   * @method constructor
   * @return {[type]}    [description]
   */
  constructor() {
    /** @var {Object} */
    this.logger = Logger.getInstace();
  }

  /**
   * Obtain used logger.
   * @method getLogger
   * @return {Object}
   */
  getLogger() {
    return this.logger;
  }

  /**
   * Set used logger.
   * @see Logger#getInstance() class.
   * @method setLog
   * @param  {Object} logger This should be an instance of debug-logger or a similar tool.
   */
  setLog(logger) {
    this.logger = logger;
  }

}
