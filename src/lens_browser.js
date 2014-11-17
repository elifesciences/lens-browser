"use strict";

var Application = require("substance-application");
var BrowserController = require("./browser_controller");


// The Lens Browser Application
// ========
//

var Browser = function(config) {
  config = config || {};
  config.routes = config.routes || this.getRoutes();

  // Note: call this after configuration, e.g., routes must be configured before
  //   as they are used to setup a router
  Application.call(this, config);

  this.controller = config.controller || this.createController(config);
};

Browser.Prototype = function() {

  // Start listening to routes
  // --------

  this.render = function() {
    this.view = this.controller.createView();
    this.$el.html(this.view.render().el);
  };

  this.getRoutes = function() {
    return Browser.getDefaultRoutes();
  };

  this.createController = function(config) {
    return new BrowserController(config);
  };
};


Browser.Prototype.prototype = Application.prototype;
Browser.prototype = new Browser.Prototype();
Browser.prototype.constructor = Browser;

Browser.DEFAULT_ROUTES = [
  {
    "route": "",
    "name": "browser",
    "command": "openBrowser"
  }
];

Browser.getDefaultRoutes = function() {
  return Browser.DEFAULT_ROUTES;
};

Browser.Controller = BrowserController;
Browser.BrowserController = BrowserController;

module.exports = Browser;
