"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// Browser.View Constructor
// ========
//

var BrowserView = function(controller) {
  View.call(this);

  this.controller = controller;
  this.$el.attr({id: "container"});

  // Elements
  // --------

  // Search bar
  // ------------

  this.searchbarEl = $$('#searchbar', {html: ''});
  this.searchFieldEl = $$('input.search-field', {type: "text"});
  this.searchbarEl.appendChild(this.searchFieldEl);
  this.searchButton = $$('a.search-button' , {href: "#", text: 'Search'});
  this.searchbarEl.appendChild(this.searchButton);

  // Results
  // ------------

  this.resultsEl = $$('#results');

  // List of found documents
  // ------------

  // Left floated 50%
  this.documentsEl = $$('#documents');
  this.resultsEl.appendChild(this.documentsEl);

  // Panel Wrapper
  // ------------
  //
  // Right floated 50%

  this.panelsEl = $$('#panels');
  this.resultsEl.appendChild(this.panelsEl);

  this.filtersEl = $$('#filters');
  this.panelsEl.appendChild(this.filtersEl);

  this.previewEl = $$('#previewEl');
  this.panelsEl.appendChild(this.previewEl);


  // Events

  $(this.searchButton).click('a.search-button', _.bind(this.startSearch, this));
};

BrowserView.Prototype = function() {

  // Session Event handlers
  // --------
  //

  this.startSearch = function(e) {
    // TODO: read content from search input field
    var searchstr = $(this.searchFieldEl).val();
    if (searchstr) {
      this.controller.switchState({
        id: "main",
        searchstr: searchstr
      });
    }
    e.preventDefault();
  };


  this.renderSearchResult = function() {
    console.log('render searchresult');
  };

  // Rendering
  // ==========================================================================
  //

  // After state transition
  this.afterTransition = function(oldState, newState) {
    if (newState.id === "main") {
      if (newState.searchstr) {
        this.renderSearchResult();
        // if the search has not changed then 'likely' the filter has
        // TODO: could be detected more explicitly
        if (oldState.searchstr === newState.searchstr) {
          console.log('filters have been changed...');
          this.updateFilters();
        }
      } else {
        // TODO: render 'moderated' list of documents
      }
    }
  };

  // Display initial search result
  this.renderSearchResult = function() {
    var documents = this.controller.searchResult.documents;

    _.each(documents, function(doc) {
      var documentEl = $$('.document', {children: [
        $$('a.toggle-preview', {href: '#', html: '<i class="fa fa-eye"></i> Preview'}),
        $$('a.title', {href: '#', text: doc.title}),
        $$('.authors', {text: doc.authors.join(', ')}),
        $$('.intro', {text: doc.intro}),
        $$('.published-on', {text: doc.published_on})
      ]});
      this.documentsEl.appendChild(documentEl);
    }, this);

    this.renderFilters();
  };

  this.renderFilters = function() {


    // TODO: extract facets from list of documents and set filters
    var filters = [
      {
        "name": "Article Type",
        "values": [
          {
            "name": "Research Article",
            "frequency": 6
          },
          {
            "name": "Editorial",
            "frequency": 6
          }
        ]
      },
      {
        "name": "Subject",
        "values": [
          {
            "name": "Neuroscience",
            "frequency": 3
          },
          {
            "name": "Cell biology",
            "frequency": 2
          }
        ]
      },
      {
        "name": "Auhors",
        "values": [
          {
            "name": "Keigo Araki",
            "frequency": 1
          },
          {
            "name": "Mie Yamamoto",
            "frequency": 2
          }
        ]
      }
    ];

    // Render filter categories



    _.each(filters, function(filter) {
      var filterEl = $$('.filter');

      // Filter name
      filterEl.appendChild($$('.filter-name', { text: filter.name }));
      var filterValuesEl = $$('.filter-values');

      _.each(filter.values, function(filterValue) {
        filterValuesEl.appendChild($$('a.value', {href: "#", text: filterValue.name + " ("+filterValue.frequency+")"}));
      }, this);

      filterEl.appendChild(filterValuesEl);

      this.filtersEl.appendChild(filterEl);

    }, this);

  };

  // Update documents listing according to changed filters
  this.updateFilters = function() {

  };

  this.displayPreview = function() {
    // Hide facets panel and instead show article preview according to state
  };

  this.render = function() {
    this.el.innerHTML = "";

    this.el.appendChild(this.searchbarEl);
    this.el.appendChild(this.resultsEl);

    return this;
  };

  this.dispose = function() {
    this.stopListening();
    if (this.mainView) this.mainView.dispose();
  };
};

// Export
// --------

BrowserView.Prototype.prototype = View.prototype;
BrowserView.prototype = new BrowserView.Prototype();

module.exports = BrowserView;