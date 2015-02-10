"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var BrowserView = require("./browser_view");
var SearchResult = require("./search_result");
var SearchBarController = require("./searchbar_controller");

// BrowserController
// =============================

var BrowserController = function(app, config) {
  Controller.call(this, app);
  this.config = config;
  this.searchbarCtrl = new SearchBarController(this);
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

    if (newState.id === "main") {

      // Handle edge case: no searchstr provided
      // TODO: load a set of featured articles
      // if (!newState.searchstr) return cb(null);
      // debugger;
      
      if (this.state.id === "uninitialized" || newState.searchstr !== this.state.searchstr || !_.isEqual(newState.searchFilters, this.state.searchFilters)) {
        // Search result has changed after initialization
        this.loadSearchResult(newState, cb);
      } else if (!_.isEqual(newState.filters, this.state.filters)) {
        // Filters have been changed
        this.filterDocuments(newState, cb);
      } else if (newState.documentId && newState.documentId !== this.state.documentId) {
        // Selected document has been changed
        this.loadPreview(newState.documentId, newState.searchstr, cb);
      } else {
        console.log('no state change detected, skipping', this.state, newState);
        // cb(null);
        return cb(null, {skip: true});
      }

    } else {
      console.log('state not explicitly handled', this.state, newState);
      return cb(null);
      // cb(null);
    }
  };

  this.encodeFilters = function() {

  };

  // Encode search filters so they can be provided to the search API as a query string
  this.encodeSearchFilters = function(searchFilters) {
    var serializedFilters = {};
    _.each(searchFilters, function(f) {
      if (!serializedFilters[f.facet]) {
        serializedFilters[f.facet] = []
      }
      serializedFilters[f.facet].push(encodeURIComponent(f.value));
    });

    var filterQuery = [];
    _.each(serializedFilters, function(f, key) {      
      filterQuery.push(key+"="+f.join(','));
    });

    return filterQuery.join('&');
  };

  // Get filters from new state
  this.getSearchFilters = function(newState) {
    return newState.searchFilters || {};
  };

  // Get filters from new state
  this.getFilters = function(newState) {
    return newState.filters || {};
  };

  // Filter documents according to new filter criteria
  // -----------------------
  // 

  this.filterDocuments = function(newState, cb) {
    var filters = this.getFilters(newState);
    this.searchResult.applyFilters(filters);
    cb(null);
  };

  // Load preview
  // -----------------------
  // 

  this.loadPreview = function(documentId, searchStr, cb) {
    // Get filters from app state
    var self = this;

    $.ajax({
      url: self.config.api_url+"/search/document?documentId="+encodeURIComponent(documentId)+"&searchString="+encodeURIComponent(searchStr),
      dataType: 'json',
      success: function(data) {
        var elifeID = _.last(documentId.split("."));
        data.document.id = documentId;
        data.document.url = "http://lens.elifesciences.org/" + elifeID;
        data.document.pdf_url = "http://cdn.elifesciences.org/elife-articles/"+elifeID+"/pdf/elife"+elifeID+".pdf";

        self.previewData = data;
        cb(null);
      },
      error: function(err) {
        console.error(err.responseText);
        cb(err.responseText);
      }
    });
  };

  // Search result gets loaded
  // -----------------------
  // 
  // Filters must be applied too, if there are any
  // Preview must be loaded as well, if documentId is provided
  // TODO: error handling

  this.loadSearchResult = function(newState, cb) {

    this.view.showLoading();

    // Get filters from app state
    var searchStr = newState.searchstr || "";
    var documentId = newState.documentId;
    var filters = this.getFilters(newState);
    var searchFilters = this.getSearchFilters(newState);
    var self = this;

    var encodedSearchFilters = this.encodeSearchFilters(searchFilters);

    $.ajax({
      url: this.config.api_url+"/search?searchString="+encodeURIComponent(searchStr)+"&"+encodedSearchFilters,
      dataType: 'json',
      success: function(matchingDocs) {
        // TODO: this structure should be provided on the server
        self.searchResult = new SearchResult({
          query: newState.searchstr,
          documents: matchingDocs
        }, filters);

        // Preview first document by default
        if (!documentId && matchingDocs.length > 0) {
          documentId = matchingDocs[0].id;
        }

        if (documentId) {
          self.loadPreview(documentId, newState.searchstr, cb);  
        } else {
          self.previewData = null;
          cb(null);
        }
      },
      error: function(err) {
        console.error(err.responseText);
        cb(err.responseText);
      }
    });
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