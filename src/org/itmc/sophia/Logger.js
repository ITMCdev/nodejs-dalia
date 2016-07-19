/**
 * 
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
   * @param  {[type]}    name =             'sophia' [description]
   * @return {Object}         [description]
   */
  static getInstance(name = 'sophia') {
    return require('debug-logger')(name);
  }

}
