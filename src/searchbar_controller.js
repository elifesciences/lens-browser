"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var SearchbarView = require("./searchbar_view");

// BrowserController
// =============================

var SearchbarController = function(app, config) {
  Controller.call(this);

  this.config = config;

  this.createView();
};

SearchbarController.Prototype = function() {

  this.initialize = function(newState, cb) {
    cb(null);
  };

  this.DEFAULT_STATE = {
    id: "main"
  };

  this.createView = function() {
    if (!this.view) {
      this.view = new SearchbarView(this);
    }
    return this.view.render();
  };

  this.transition = function(newState, cb) {
  };


  // Get filters from new state
  this.getFilters = function(newState) {
    if (!newState.filters) return {};
    return JSON.parse(newState.filters);
  };

  // Filter documents according to new filter criteria
  // -----------------------
  // 

  // this.afterTransition = function(oldState) {
  //   var newState = this.state;
  //   this.view.afterTransition(oldState, newState);
  // };
};

SearchbarController.Prototype.prototype = Controller.prototype;
SearchbarController.prototype = new SearchbarController.Prototype();

SearchbarController.Controller = SearchbarController;

module.exports = SearchbarController;