
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
