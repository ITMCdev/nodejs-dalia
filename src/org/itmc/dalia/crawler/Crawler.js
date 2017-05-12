/**
 * Dalia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-dalia/)
 *
 * Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
 *
 * @link      http://github.com/itmcdev/nodejs-dalia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-dalia/LICENSE MIT License
 */

import EventEmitter from 'events';

import 'babel-polyfill';

/**
 * @class Crawler
 */
export default class Crawler {

  /**
   * @type {Object}
   */
  events = null;

  /**
   * @type {Object}
   */
  options = {};

  /**
   * @get
   * @returns {EventEmitter|Object}
   */
  get events() {
    if (!this.events) {
      this.events = new EventEmitter();
    }
    return this.events;
  }

  /**
   * Creates an instance of Nightmare.
   * 
   * @param {Object} options
   * @param {EventEmitter|Object} events
   */
  constructor(options = {}, events = null) {
    this.options = options;
    this.events = events;
  }

  /**
   * @see EventEmitter::emit()
   */
  emit(...args) {
    this.events.emit(...args);
  }

  async end() { throw new Error('`Crawl` is an abstract class'); }

  /**
   * Grabs a page
   * @param {String} url 
   * @param {Function|Number|String} waitFor
   * @link https://github.com/segmentio/nightmare#waitms
   */
  async fetch(url, waitFor) { throw new Error('`Crawl` is an abstract class'); }

  async find(selector, map = null) { throw new Error('`Crawl` is an abstract class'); }

  async findOne(selector, map = null) { throw new Error('`Crawl` is an abstract class'); }

  /**
   * Singleton
   * @returns Crawler
   */
  static getInstance(options = {}) { throw new Error('`Crawl` is an abstract class'); }

  async html() { throw new Error('`Crawl` is an abstract class'); }

  /**
   * @see EventEmitter::on()
   */
  on(...args) {
    this.events.on(...args);
  }

  /**
   * @see EventEmitter::once()
   */
  once(...args) {
    this.events.once(...args);
  }
}
