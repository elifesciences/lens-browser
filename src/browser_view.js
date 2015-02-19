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
  this.documentsEl.appendChild($$('.no-result', {text: "Please enter a search term to start"}));

  this.previewEl = $$('#preview');

  // Loading indicator
  this.loadingEl = $$('.loading', {html: '<div class="spinner-wrapper"><div class="spinner"></div><div class="message">Loading documents</div></div>'});

  // Wrap what we have into a panel wrapper
  this.panelWrapperEl = $$('.panel-wrapper');
  this.panelWrapperEl.appendChild(this.facetsEl);
  this.panelWrapperEl.appendChild(this.documentsEl);
  this.panelWrapperEl.appendChild(this.previewEl);
  this.panelWrapperEl.appendChild(this.loadingEl);

  // Event handlers
  // ------------

  // $(this.searchButton).click(_.bind(this.startSearch, this));
  // $(this.searchFieldEl).change(_.bind(this.startSearch, this));

  this.$el.on('click', '.available-facets .value', _.bind(this.toggleFilter, this));
  this.$el.on('click', '.document', _.bind(this.togglePreview, this));

  // Should this work on the controller?
  // this.searchbarView.on('search:changed', _.bind(this.startSearch, this));
};

BrowserView.Prototype = function() {

  this.togglePreview = function(e) {
    e.preventDefault();
    var documentId = $(e.currentTarget).attr('data-id');
    this.controller.openPreview(documentId);
  };

  this.toggleFilter = function(e) {
    e.preventDefault();
    var facet = $(e.currentTarget).attr("data-facet");
    var facetValue = $(e.currentTarget).attr("data-value");

    console.log('toggling', facet, facetValue);
    this.controller.searchQuery.addFilter(facet, facetValue);
  };

  // Show the loading indicator
  this.showLoading = function() {
    $(this.loadingEl).show();
  };

  // Hide the loading indicator
  this.hideLoading = function() {
    $(this.loadingEl).hide();
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
        // TODO: update facets view
      } else if (newState.documentId && newState.documentId !== oldState.documentId) {
        console.log('render preview now', this.controller.previewData);
        this.renderPreview();
      }
    }
  };

  this.renderPreview = function() {
    var documentId = this.controller.state.documentId;

    // this.previewEl.innerHTML = "";
    // this.$('.document').removeClass('active')

    if (documentId) {
      var previewEl = new PreviewView(this.controller.previewData);
      // this.previewEl.appendChild(this.previewView.render().el);


      this.$('.document .preview').remove();

      // Highlight previewed document in result list
      this.$('.document').each(function() {
        if (documentId === this.dataset.id) {
          // render preview here
          console.log('meeh', previewEl);
          console.log(this);
          this.appendChild(previewEl.render().el);
          // $(this).addClass('active');
        }
      });
    }
  };

  this.renderFacets = function() {
    this.facetsView = new FacetsView(this.controller.searchResult.getAvailableFacets());
    this.facetsEl.innerHTML = "";
    this.facetsEl.appendChild(this.facetsView.render().el);
  };

  // Display initial search result
  this.renderSearchResult = function() {
    var searchStr = this.controller.state.searchQuery.searchStr;

    // Check if there's an actual search result
    if (!this.controller.searchResult) return;

    this.documentsEl.innerHTML = "";

    // Hide loading indicator
    this.hideLoading();

    // Get filtered documents
    var documents = this.controller.searchResult.getDocuments();
    // console.log('docs', documents);
    
    if (documents.length > 0) {
      _.each(documents, function(doc, index) {
        var authors = [];

        _.each(doc.authors, function(author) {
          var authorEl = $$('span.author.facet-occurence', {text: author});
          authors.push(authorEl);
        }, this);

        // var categoriesEl = $$('.categories');
        // var articleTypeEl = $$('.article_type.facet-occurence', {text: doc.article_type });
        // categoriesEl.appendChild(articleTypeEl);

        // // Iterate over subjects and display
        // _.each(doc.subjects, function(subject) {
        //   var subjectEl = $$('.subjects.facet-occurence', {text: subject});
        //   categoriesEl.appendChild(subjectEl);
        // }, this);

        var documentEl = $$('.document', {
          "data-id": doc.id,
          children: [
            $$('.published-on', {text: new Date(doc.published_on).toDateString() }),
            $$('.title', {
              children: [
                $$('a', {href: "#", html: doc.title})
              ]
            }),
            $$('.authors', {
              children: authors
            }),
            $$('a.toggle-preview', {href: "#", html: 'Show matches for "'+searchStr+'" <i class="fa fa-sort-desc"></i>'}),
            // $$('.preview')
            // $$('.intro', {text: doc.intro}),
            // categoriesEl
          ]
        });

        this.documentsEl.appendChild(documentEl);
      }, this);

      this.renderFacets();
    } else {
      // Render no search result
      this.documentsEl.appendChild($$('.no-result', {text: "Your search did not match any documents"}));
    }
  };

  this.render = function() {
    console.log('BrowserView#render');
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
