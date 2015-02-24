"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;
var SearchbarView = require("./searchbar_view");
var PreviewView = require("./preview_view");
var FacetsView = require("./facets_view");


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

  this.searchbarView = new SearchbarView(this.controller.searchQuery, {
    getSuggestions: _.bind(this.controller.getSuggestions, this.controller)
  });

  // TODO: create PreviewView

  // List of found documents
  // ------------
  // 

  this.facetsEl = $$('#facets');
  this.documentsEl = $$('#documents');
  this.documentsEl.appendChild($$('.no-result', {text: "Loading documents ..."}));

  this.previewEl = $$('#preview');

  // Loading indicator
  // this.loadingEl = $$('.loading', {html: '<div class="spinner-wrapper"><div class="spinner"></div><div class="message">Loading documents</div></div>'});

  // Wrap what we have into a panel wrapper
  this.panelWrapperEl = $$('.panel-wrapper');
  this.panelWrapperEl.appendChild(this.facetsEl);
  this.panelWrapperEl.appendChild(this.documentsEl);
  this.panelWrapperEl.appendChild(this.previewEl);
  

  // Event handlers
  // ------------

  // $(this.searchButton).click(_.bind(this.startSearch, this));
  // $(this.searchFieldEl).change(_.bind(this.startSearch, this));

  this.$el.on('click', '.available-facets .value', _.bind(this.toggleFilter, this));
  this.$el.on('click', '.document .toggle-preview', _.bind(this.togglePreview, this));

  // Should this work on the controller?
  // this.searchbarView.on('search:changed', _.bind(this.startSearch, this));

  // Each time the search query changes we re-render the facets panel
  this.controller.searchQuery.on('query:changed', _.bind(this.renderFacets, this));
};

BrowserView.Prototype = function() {

  this.togglePreview = function(e) {
    e.preventDefault();
    var documentId = $(e.currentTarget).parent().attr('data-id');
    this.controller.openPreview(documentId);
  };

  this.toggleFilter = function(e) {
    e.preventDefault();
    var facet = $(e.currentTarget).attr("data-facet");
    var facetValue = $(e.currentTarget).attr("data-value");

    this.controller.searchQuery.toggleFilter(facet, facetValue);
  };

  // Show the loading indicator
  this.showLoading = function() {
    $('.progress-bar').removeClass('done loading').show();
    _.delay(function() {
      // $('.spinner').hide();
      $('.progress-bar').addClass('loading');
    }, 10);

  };

  // Hide the loading indicator
  this.hideLoading = function() {
    $(this.loadingEl).hide();
    // $('.progress-bar').removeClass('loading');
    $('.progress-bar').addClass('done');

    _.delay(function() {
      $('.progress-bar').hide();
    }, 1000);
    
  };

  // Rendering
  // ==========================================================================
  //

  // After state transition
  // --------------
  // 

  this.afterTransition = function(oldState, newState) {
    if (newState.id === "main") {
      if (!_.isEqual(newState.searchQuery, oldState.searchQuery)) {
        this.renderSearchResult();
        this.renderPreview();
        this.hideLoading();
        // TODO: update facets view
      } else if (newState.documentId && newState.documentId !== oldState.documentId) {
        this.renderPreview();
        this.hideLoading();
      }
    }
  };

  this.renderPreview = function() {
    var documentId = this.controller.state.documentId;

    if (documentId) {
      var previewEl = new PreviewView(this.controller.previewData);

      // Highlight previewed document in result list
      this.$('.document').each(function() {
        if (documentId === this.dataset.id) {
          // render preview here
          this.appendChild(previewEl.render().el);
        }
      });
    }
  };

  this.renderFacets = function() {
    console.log('rendering facets...');

    this.facetsView = new FacetsView(this.controller.searchResult.getAvailableFacets());
    this.facetsEl.innerHTML = "";
    this.facetsEl.appendChild(this.facetsView.render().el);
  };

  // Display initial search result
  this.renderSearchResult = function() {
    var searchStr = this.controller.state.searchQuery.searchStr;
    var filters = this.controller.state.searchQuery.filters;

    // Check if there's an actual search result
    if (!this.controller.searchResult) return;

    this.documentsEl.innerHTML = "";


    // Get filtered documents
    var documents = this.controller.searchResult.getDocuments();
    
    if (documents.length > 0) {
      _.each(documents, function(doc, index) {
        var authors = [];

        _.each(doc.authors, function(author) {
          var authorEl = $$('span.author.facet-occurence', {text: author});
          authors.push(authorEl);
        }, this);

        // Matching filters
        // --------------

        var filtersEl = $$('.filters');
        _.each(filters, function(filterVals, key) {
          var docVals = doc[key];
          if (!_.isArray(docVals)) docVals = [docVals];

          _.each(filterVals, function(filterVal) {
            if (_.include(docVals, filterVal)) {
              var filterEl = $$('.filter', {text: filterVal});
              filtersEl.appendChild(filterEl);
            }
          });
        });

        var documentEl = $$('.document', {
          "data-id": doc.id,
          children: [
            $$('.published-on', {text: new Date(doc.published_on).toDateString() }),
            $$('.title', {
              children: [
                $$('a', { href: doc.url, target: "_blank", html: doc.title })
              ]
            }),
            $$('.authors', {
              children: authors
            }),
            filtersEl
          ]
        });

        // TODO: replace this with check doc.matches_count > 0
        if (searchStr) {
          var togglePreviewEl = $$('a.toggle-preview', {href: "#", html: '<i class="fa fa-eye"></i> Show matches for "'+searchStr+'"'});
          documentEl.appendChild(togglePreviewEl);
        }

        this.documentsEl.appendChild(documentEl);
      }, this);

    } else {
      // Render no search result
      this.documentsEl.appendChild($$('.no-result', {text: "Your search did not match any documents"}));
    }

    this.renderFacets();
  };

  this.render = function() {
    this.el.innerHTML = "";
    this.el.appendChild(this.searchbarView.render().el);
    this.el.appendChild(this.panelWrapperEl);
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
