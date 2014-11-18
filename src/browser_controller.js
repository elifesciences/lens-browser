"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var BrowserView = require("./browser_view");
var exampleSearchResult = require("../data/searchresult");

var BrowserController = function(app) {
  Controller.call(this, app);

  this.createView();
};

BrowserController.Prototype = function() {

  this.initialize = function(newState, cb) {
    cb(null);
  };

  this.DEFAULT_STATE = {
    id: "main"
  };

   this.createView = function() {
    if (!this.view) {
      this.view = new BrowserView(this);
    }
    return this.view.render();
  };

  this.transition = function(newState, cb) {
    console.log("BrowserController.transition(%s -> %s)", this.state.id, newState.id);
    // idem-potence
    // if (newState.id === this.state.id) {
    //   var skip = false;
    //   // TODO
    //   skip = true;
    //   if (skip) return cb(null, {skip: true});
    // }

    if (newState.id === "main" && newState.searchstr && newState.searchstr !== this.state.searchstr) {
      this.loadSearchResult(newState.searchstr, cb);
    }

    cb(null);
  };

  this.loadSearchResult = function(searchStr, cb) {
    
    this.searchResult = exampleSearchResult;
    console.log('loading search result', exampleSearchResult);
    cb(null);
  };

  this.afterTransition = function(oldState) {
    var newState = this.state;
    this.view.afterTransition(oldState, newState);
  };

};

BrowserController.Prototype.prototype = Controller.prototype;
BrowserController.prototype = new BrowserController.Prototype();

BrowserController.Controller = BrowserController;

module.exports = BrowserController;