"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var BrowserView = require("./browser_view");

var SearchQuery = require("./search_query");
var SearchResult = require("./search_result");

// Used to initialize the SearchQuery model
var EMPTY_QUERY = {
  searchStr: "",
  filters: {}
};

var EXAMPLE_QUERY = {
  searchStr: "mouse",
  filters: {
    "subjects": ["Neuroscience"],
    "article_type": ["Research article"]
  }
};

var AVAILABLE_SUGGESTIONS = {
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

var BrowserController = function(app, config) {
  Controller.call(this, app);
  this.config = config;

  this.searchQuery = new SearchQuery(EMPTY_QUERY);
  this.createView();

  this.searchQuery.on('query:changed', _.bind(this.startSearch, this));
};

BrowserController.Prototype = function() {

  this.initialize = function(newState, cb) {
    cb(null);
  };

  this.DEFAULT_STATE = {
    id: "main"
  };

  // Initiate a new search by making a state change
  // ------------------

  this.startSearch = function() {
    console.log('starting a new search');

    this.switchState({
      id: "main",
      searchQuery: this.searchQuery.toJSON(),
    }, {updateRoute: true, replace: true});
  };

  // Available search suggestions
  // SearchbarView needs this
  this.getSuggestions = function(searchStr) {
    var suggestions = [];

    if (!searchStr) return [];

    _.each(AVAILABLE_FACETS, function(facet, facetKey) {
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

  this.createView = function() {
    if (!this.view) {
      this.view = new BrowserView(this);
    }
    return this.view;
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

      if (this.state.id === "uninitialized") {
        // Set the initial search query from app state
        // TODO: this could be done in a 
        console.log('setting initial query', newState.searchQuery);

        var query = newState.searchQuery;
        if (!query) query = EXAMPLE_QUERY;
        this.searchQuery.setQuery(query);
        // this.loadSearchResult(newState, cb);
      }

      if (!_.isEqual(newState.searchQuery, this.state.searchQuery)) {
        // Search query has changed
        this.loadSearchResult(newState, cb);
        // } else if (newState.searchstr !== this.state.searchstr || !_.isEqual(newState.searchFilters, this.state.searchFilters)) {
        //   // Search result has changed after initialization
        //   this.loadSearchResult(newState, cb);
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
    var searchQuery = newState.searchQuery;
    var documentId = newState.documentId;
    var self = this;

    $.ajax({
      url: this.config.api_url+"/search?searchQuery="+encodeURIComponent(JSON.stringify(searchQuery)),
      dataType: 'json',
      success: function(matchingDocs) {

        // TODO: this structure should be provided on the server
        self.searchResult = new SearchResult({
          query: newState.searchstr,
          documents: matchingDocs
        }, {});

        self.previewData = null;
        cb(null);
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