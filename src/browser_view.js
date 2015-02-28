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

  // List of found documents
  // ------------
  // 

  this.facetsEl = $$('#facets');
  this.documentsEl = $$('#documents');
  this.documentsEl.appendChild($$('.no-result', {text: "Loading documents ..."}));

  this.previewEl = $$('#preview');


  // Wrap what we have into a panel wrapper
  this.panelWrapperEl = $$('.panel-wrapper');
  this.panelWrapperEl.appendChild(this.facetsEl);
  this.panelWrapperEl.appendChild(this.documentsEl);
  this.panelWrapperEl.appendChild(this.previewEl);
  
  // Loading spinner
  this.progressbarEl = $$('.progress-bar', {
    html: '<div class="progress loading"></div>'
  });

  // Event handlers
  // ------------

  this.$el.on('click', '.available-facets .value', _.bind(this.toggleFilter, this));
  this.$el.on('click', '.document .toggle-preview', _.bind(this.togglePreview, this));

  this.$el.on('click', '.show-more', _.bind(this._preventDefault, this));

  // Each time the search query changes we re-render the facets panel
  this.controller.searchQuery.on('query:changed', _.bind(this.renderFacets, this));
};

BrowserView.Prototype = function() {

  this._preventDefault = function(e) {
    e.preventDefault();
  };

  this.togglePreview = function(e) {
    e.preventDefault();

    var searchQuery = this.controller.searchQuery;
    var $documentEl = $(e.currentTarget).parent();
    var documentId = $documentEl.attr('data-id');
    var self = this;

    var $preview = $documentEl.find('.preview');
    if ($preview.length > 0) {
      $preview.toggle();
    } else {
      this.showLoading();
      this.controller.loadPreview(documentId, searchQuery.searchStr, function(err) {
        self.renderPreview();
        self.hideLoading();
      });
    }
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
      $('.progress-bar').addClass('loading');
    }, 10);
  };

  // Hide the loading indicator
  this.hideLoading = function() {
    $(this.loadingEl).hide();
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
        this.hideLoading();
      }
    }
  };

  this.renderPreview = function() {
    var previewData = this.controller.previewData;
    var documentId = previewData.document.id;

    if (this.controller.previewData) {
      var previewEl = new PreviewView(previewData);

      // Highlight previewed document in result list
      this.$('.document').each(function() {
        if (documentId === this.dataset.id) {
          this.appendChild(previewEl.render().el);
        }
      });
    }
  };

  this.renderFacets = function() {
    this.facetsView = new FacetsView(this.controller.searchResult.getFacets());
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
    var searchMetrics = this.controller.searchResult.getSearchMetrics();
    
    if (documents.length > 0) {

      this.documentsEl.appendChild($$('.no-result', {text: searchMetrics.hits + " articles found"}));

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
    this.el.appendChild(this.progressbarEl);
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
