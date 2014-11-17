"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var BrowserView = require("./browser_view");

// Browser.Controller
// -----------------
//
// Main Application Controller

var BrowserController = function(config) {
  Controller.call(this);

  this.config = config;

  // Main controls
  this.on('open:browser', this.openBrowser);
};

BrowserController.Prototype = function() {

  // Initial view creation
  // ===================================

  this.createView = function() {
    var view = new BrowserView(this);
    this.view = view;
    return view;
  };

  // Update URL Fragment
  // -------
  //
  // This will be obsolete once we have a proper router vs app state
  // integration.

  this.updatePath = function(state) {
    var path = [];

    console.error('TODO: no browser states modelled yet');

    window.app.router.navigate(path.join('/'), {
      trigger: false,
      replace: false
    });
  };

  this.createBrowser = function(doc, state) {
    var that = this;
    // Create new browser controller instance
    this.browser = new BrowserController(doc, state, this.config);
    this.browser.on('state-changed', function() {
      that.updatePath(that.browser.state);
    });
    this.modifyState({
      context: 'browser'
    });
  };

  // Main entry point for routes
  // ------------

  this.openBrowser = function() {
    var that = this;

    // The article view state
    var state = {
      panel: panel || "toc",
      focussedNode: focussedNode,
      fullscreen: !!fullscreen
    };

    // Already loaded?
    if (this.browser) {
      this.browser.modifyState(state);
    } else {
      this.trigger("loading:started", "Loading article");

      that.createBrowser(doc, state);
    }
  };
};

// Exports
// --------

BrowserController.Prototype.prototype = Controller.prototype;
BrowserController.prototype = new BrowserController.Prototype();
_.extend(BrowserController.prototype, util.Events);

module.exports = BrowserController;
