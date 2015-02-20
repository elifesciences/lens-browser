"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var BrowserView = require("./browser_view");

var SearchQuery = require("./search_query");
var SearchResult = require("./search_result");

var AVAILABLE_FACETS = require("./available_facets");

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
    // console.log('query changed', this.searchQuery);
    this.switchState({
      id: "main",
      searchQuery: this.searchQuery.toJSON()
    });
  };

  this.openPreview = function(documentId) {
    this.switchState({
      id: "main",
      searchQuery: this.searchQuery.toJSON(),
      documentId: documentId
    });
  };

  // Available search suggestions
  // SearchbarView needs this
  this.getSuggestions = function(searchStr) {
    var suggestions = [];
    var combinedFacets = JSON.parse(JSON.stringify(AVAILABLE_FACETS));

    if (this.searchResult) {
      var searchResultFacets = {};
      var availableFacets = this.searchResult.getAvailableFacets();

      // build facet index
      _.each(availableFacets, function(facet) {
        searchResultFacets[facet.property] = {
          name: facet.name,
          entries: facet.entries
        }
      });

      _.each(combinedFacets, function(facet, facetKey) {
        if (searchResultFacets[facetKey]) {
          combinedFacets[facetKey].entries = _.union(combinedFacets[facetKey].entries, searchResultFacets[facetKey].entries);
        }
      });
    };

    if (!searchStr) return [];

    _.each(combinedFacets, function(facet, facetKey) {
      _.each(facet.entries, function(entry) {
        if (entry.name.toLowerCase().match(searchStr.toLowerCase())) {
          suggestions.push({
            value: entry.name.replace(searchStr, "<b>"+searchStr+"</b>"),
            rawValue: entry.name,
            facet: facetKey,
            facetName: facet.name
          });
        }
      });
    });

    // console.log('Suggs', suggestions);
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
        // TODO: this could be done in a onInitialize hook?
        console.log('setting initial query', newState.searchQuery);

        var query;
        if (newState.searchQuery) {
          query= JSON.parse(JSON.stringify(newState.searchQuery));
        } else {
          query = EMPTY_QUERY;
          newState.searchQuery = query;
        }
        this.searchQuery.setQuery(query);
      }
      // debugger;
      if (!_.isEqual(newState.searchQuery, this.state.searchQuery)) {
        // Search query has changed
        this.loadSearchResult(newState, cb);
      } else if (newState.documentId && newState.documentId !== this.state.documentId) {
        // Selected document has been changed
        this.loadPreview(newState.documentId, newState.searchQuery.searchStr, cb);
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
        data.searchStr = searchStr;
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

        console.log('MATCHINGDOCS', matchingDocs);

        // Patching docs
        _.each(matchingDocs, function(doc) {
          var elifeID = _.last(doc.id.split("."));
          doc.url = "http://lens.elifesciences.org/" + elifeID;
        }, this);

        // TODO: this structure should be provided on the server
        self.searchResult = new SearchResult({
          searchQuery: searchQuery,
          documents: matchingDocs
        }, {});

        self.getSuggestions();
        if (documentId) {
          self.loadPreview(documentId, searchQuery.searchStr, cb);
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