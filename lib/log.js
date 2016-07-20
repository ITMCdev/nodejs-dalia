var log = require('debug-logger')('myapp');

log.trace("I'm a trace output");
log.debug("I'm a debug output");
log.log("I'm a log output");
log.info("I'm an info output");
log.warn("I'm a warn output");
log.error("I'm an error output");
