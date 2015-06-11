"use strict";

var _ = require("underscore");
var Application = require("substance-application");
var BrowserController = require("./browser_controller");
var DefaultRouter = require("substance-application").DefaultRouter;

var LensBrowserApplication = function(config) {
  Application.call(this);
  this.controller = new BrowserController(this, config);
  var router = new DefaultRouter(this);
  this.setRouter(router);
};

LensBrowserApplication.Prototype = function() {
  var __super__ = Application.prototype;

  this.start = function(options) {
    __super__.start.call(this, options);

    // Inject main view
    this.el.appendChild(this.controller.view.render().el);

    if (!window.location.hash) {
      this.switchState([{ id: "main" }], { updateRoute: true, replace: true });
    }
  };
};

LensBrowserApplication.Prototype.prototype = Application.prototype;
LensBrowserApplication.prototype = new LensBrowserApplication.Prototype();

module.exports = LensBrowserApplication;
