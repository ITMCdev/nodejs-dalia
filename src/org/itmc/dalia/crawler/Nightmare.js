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

import * as NLIB from 'nightmare';

import Crawler from './crawler';
// import {Nightmare as NLIB} from 'nightmare';

/**
 * @class Nightmare
 */
export class Nightmare extends Crawler {
  /**
   * @type NLIB
   */
  nightmare = null;

  /**
   * @see Crawler::constructor()
   */
  constructor(options = {}, events = null) {
    super(options);
    this.nightmare = new NLIB.default(options);
  }

  /**
   * @see Crawler::getInstance()
   * @returns Nightmare
   */
  static getInstance(options = {}) {
    return new Nightmare(options);
  }

  /**
   * @see Crawler::grab()
   */
  async fetch(url, waitFor) {
    await this.nightmare.goto(url).wait(waitFor).catch((err) => {
      this.events.trigger('crawler::grab::error', err);
      return null;
    });
    this.events.trigger('crawler:pulled', this.html());
    return this;
  }

  /**
   * @see Crawler::find()
   */
  async find(selector, map = null) {
    let result = await this.nightmare.evaluate(() => {
      return (!map instanceof Function) ? 
        document.querySelectorAll(selector) : 
        map(Array.from(document.querySelectorAll(selector)));
    }).catch((err) => { 
      this.events.trigger('crawler::find::error', err);
      return null;
    });
    this.events.trigger('crawler::find', result);
    return result;
  }

  /**
   * @see Crawler::findOne()
   */
  async findOne(selector, map = null) {
    let result = await this.nightmare.evaluate(() => {
      return (!map instanceof Function) ? 
        document.querySelector(selector) : 
        map(document.querySelector(selector));
    }).catch((err) => { 
      this.events.trigger('crawler::findOne::error', err);
      return null;
    });
    this.events.trigger('crawler::findOne', result);
    return result;
  }

  /**
   * @see Crawler::html()
   */
  async html() {
    return await this.nightmare.evaluate(() => document.documentElement.outerHTML)
        .catch(err => console.log('Error', err));
  }

  /**
   * @see Crawler::end()
   */
  async end() {
    await this.nightmare.end();
  }

}
