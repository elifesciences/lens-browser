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
  // 
  // Left floated 60%

  this.documentsEl = $$('#documents');
  this.resultsEl.appendChild(this.documentsEl);

  // Panel Wrapper
  // ------------
  //
  // Right floated 40%

  this.panelsEl = $$('#panels');
  this.resultsEl.appendChild(this.panelsEl);

  this.facetsEl = $$('#facets');
  this.panelsEl.appendChild(this.facetsEl);

  this.previewEl = $$('#previewEl');
  this.panelsEl.appendChild(this.previewEl);

  this.elementIndex = {};

  // Event handlers
  // ------------

  $(this.searchButton).click(_.bind(this.startSearch, this));
  this.$el.on('click', '.value', _.bind(this.toggleFilter, this));
};

BrowserView.Prototype = function() {

  // Session Event handlers
  // --------
  //

  this.startSearch = function(e) {
    e.preventDefault();
    var searchstr = $(this.searchFieldEl).val();
    if (searchstr) {
      this.controller.switchState({
        id: "main",
        searchstr: searchstr
      });
    }
  };

  this.toggleFilter = function(e) {
    e.preventDefault();

    var facetName = e.currentTarget.dataset.facet;
    var value = e.currentTarget.dataset.value;

    // TODO: this preparing of new filter state is quite hacky.
    // We need to find a better way

    var filters = this.controller.searchResult.filters;

    // Implicitly remove a filter if already set
    if ($(e.currentTarget).hasClass('selected')) {
      filters[facetName] = _.without(filters[facetName], value);
      
      if (filters[facetName].length === 0) {
        delete filters[facetName];
      }
    } else {
      // Add new filter
      if (!filters[facetName]) {
        filters[facetName] = [];
      }
      filters[facetName].push(value);
    }

    // Update state
    this.controller.switchState({
      id: "main",
      searchstr: this.controller.state.searchstr,
      filters: JSON.stringify(filters)
    });
  };

  // Rendering
  // ==========================================================================
  //

  // After state transition
  this.afterTransition = function(oldState, newState) {
    console.log('after transition');
    if (newState.id === "main") {
      if (newState.searchstr) {
        // console.log('MEH', newState.searchstr);
        this.renderSearchResult();
        // if the search has not changed then 'likely' the filter has
        // TODO: could be detected more explicitly
        if (oldState.searchstr === newState.searchstr) {
          console.log('filters have been changed...');
          this.renderSearchResult();
        }
      } else {
        // TODO: render 'moderated' list of documents
      }
    }
  };

  // Display initial search result
  this.renderSearchResult = function() {
    this.documentsEl.innerHTML = "";

    // Reset element index
    this.elementIndex = {};

    // Get filtered documents
    var documents = this.controller.searchResult.getDocuments();

    _.each(documents, function(doc) {
      var authors = [];

      _.each(doc.authors, function(author) {
        var authorEl = $$('span.author.facet-occurence', {text: author});
        this.elementIndex["authors/"+author] = authorEl;
        authors.push(authorEl);
      }, this);

      var documentEl = $$('.document', {children: [
        $$('a.toggle-preview', {href: '#', html: '<i class="fa fa-eye"></i> Preview'}),
        $$('a.title', {href: '#', text: doc.title}),
        $$('.authors', {
          children: authors
        }),
        $$('.intro', {text: doc.intro}),
        $$('.published-on', {text: doc.published_on})
      ]});
      this.documentsEl.appendChild(documentEl);
    }, this);

    this.renderFacets();
  };

  this.renderFacets = function() {
    this.facetsEl.innerHTML = "";

    var facets = this.controller.searchResult.getAvailableFacets();

    // Render facets
    _.each(facets, function(facet) {
      var facetEl = $$('.facet');

      // Filter name
      facetEl.appendChild($$('.facet-name', { text: facet.name }));
      var facetValuesEl = $$('.facet-values');

      // Filter values + frequency in doc corpus
      _.each(facet.values, function(facetValue) {
        facetValuesEl.appendChild($$('a.value'+(facetValue.selected ? '.selected' : ''), {
          href: "#",
          "data-facet": facet.property,
          "data-value": facetValue.name,
          text: facetValue.name + " ("+facetValue.frequency+")"
        }));
      }, this);

      facetEl.appendChild(facetValuesEl);
      this.facetsEl.appendChild(facetEl);
    }, this);

    this.highlightFacets();
  };

  // Highlight currently filtered facets
  this.highlightFacets = function() {
    $('.facet-occurence.selected').removeClass('highighted');

    var filters = this.controller.searchResult.filters;
    _.each(filters, function(facetValues, facetName) {      
      _.each(facetValues, function(val) {
        var el = this.elementIndex[facetName+"/"+val];
        if (el) $(el).addClass('highlighted');
      }, this);
    }, this);
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