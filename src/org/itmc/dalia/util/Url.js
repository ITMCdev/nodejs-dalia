// import Node from 'tree-node';

// export class Leaf extends Node {
//   /**
//    * @type 
//    * @memberof QueueUrl
//    */
//   value = '';

//   /**
//    * 
//    * @memberof Leaf
//    */
//   depth = -1;

//   /**
//    * Constructor
//    * @param {String}    url
//    * @param {Number}    depth   default -1
//    */
//   constructor(url, depth = -1) {
//     this.url = url;
//     this.depth = depth;
//   }

//   /**
//    * (Getter) Determine whether Url can be crawled.
//    * @return {Boolean}
//    */
//   get canCrawl() {
//     return this.depth < 0;
//   }

//   /**
//    * Url Getter
//    * @return {String}
//    */
//   get url() {
//     if (typeof this._url === 'undefined') {
//       throw new Error(`Invalid url in ${JSON.stringify(this)}`)
//     }
//     return this._url;
//   }

//   /**
//    * Url Setter
//    * @param  {String} u
//    */
//   set url(u) {
//     this._url = u;
//   }

//   /**
//    * Depth Getter
//    * @return {Number}
//    */
//   get depth() {
//     return this._depth || -1;
//   }

//   /**
//    * Depth Setter
//    * @param  {Number} d
//    */
//   set depth(d) {
//     this._depth = d;
//   }

//   toString() {
//     return this.url;
//   }

// }
