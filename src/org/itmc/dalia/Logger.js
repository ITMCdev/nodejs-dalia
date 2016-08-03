/**
 * Dalia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-dalia/)
 *
 * Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
 *
 * @link      http://github.com/itmcdev/nodejs-dalia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-dalia/LICENSE MIT License
 */

/**
 *
 */
export class Logger {

  /**
   * Singleton for Logger object.
   * @link https://www.npmjs.com/package/debug-logger
   *
   * @method getInstance
   * @param  {String}    name Instance name
   * @return {Object}         Logger object
   */
  static getInstance(name = 'dalia') {
    return require('debug-logger')(name);
  }

}
