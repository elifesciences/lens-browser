"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var SearchbarView = require("./searchbar_view");

// Static fixture for suggested filters
// -------------------------

var MAX_SUGGESTIONS = 10;

var AVAILABLE_FACETS = {
  "subjects": {
    "name": "Subjects",
    "entries": [
      "Biochemistry",
      "Biophysics and structural biology",
      "Cancer biology",
      "Cell biology",
      "Computational and systems biology",
      "Developmental biology and stem cells",
      "Ecology",
      "Epidemiology and global health",
      "Genes and chromosomes",
      "Genomics and evolutionary biology",
      "Human biology and medicine",
      "Immunology",
      "Microbiology and infectious disease",
      "Neuroscience",
      "Plant biology"
    ]
  },
  "article_type": {
    "name": "Content Type",
    "entries": [
      "Editorial",
      "Feature article",
      "Insight",
      "Research article",
      "Short report",
      "Research advance",
      "Registered report",
      "Correction"
    ]
  }
};

// BrowserController
// =============================

var SearchbarController = function(app, config) {
  Controller.call(this);

  this.config = config;

  this.filters = [
  ];

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
    return this.view;
  };

  // this.transition = function(newState, cb) {
  // };

  // Add a new search filter
  // ----------------------

  this.addFilter = function(facet, value) {
    this.filters.push({
      facet: facet,
      value: value
    });
  };

  this.removeLastFilter = function() {
    this.filters.pop();
  };

  // Get currently selected filters
  // ----------------------

  this.getFilters = function() {
    return this.filters;
  };

  // Get currently selected filters
  // ----------------------

  this.getSuggestions = function(searchStr) {
    var suggestions = [];

    if (!searchStr) return [];

    _.each(AVAILABLE_FACETS, function(facet, facetKey) {
      _.each(facet.entries, function(entry) {
        if (entry.toLowerCase().match(searchStr.toLowerCase())) {
          suggestions.push({
            value: entry.replace(searchStr, "<b>"+searchStr+"</b>"),
            rawValue: entry,
            facet: facetKey,
            facetName: facet.name
          });
        }
      });
    });

    // only return MAX_SUGGESTIONS
    return suggestions;
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