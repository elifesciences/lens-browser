"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;
var SearchbarView = require("./searchbar_view");
var PreviewView = require("./preview_view");

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

  // Facets panel
  // ------------

  // TODO: create FacetsView

  // Preview panel
  // ------------

  

  // TODO: create PreviewView

  // List of found documents
  // ------------
  // 

  this.facetsEl = $$('#facets');
  this.documentsEl = $$('#documents');
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

  // this.$el.on('click', '.value', _.bind(this.toggleFilter, this));
  this.$el.on('click', '.title a', _.bind(this.togglePreview, this));

  // Should this work on the controller?
  // this.searchbarView.on('search:changed', _.bind(this.startSearch, this));
};

BrowserView.Prototype = function() {

  this.togglePreview = function(e) {
    e.preventDefault();
    var documentId = $(e.currentTarget).parent().parent().attr('data-id');
    this.controller.openPreview(documentId);
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
  // TODO: optimize! (currently we re-render everything)

  this.afterTransition = function(oldState, newState) {
    console.log('BrowserView#afterTransition');
    if (newState.id === "main") {

      // if (newState.searchstr) {
      if (!_.isEqual(newState.searchQuery, oldState.searchQuery)) {
        this.renderSearchResult();
        if (this.controller.previewData) {
          this.renderPreview();  
        }
        // TODO: update facets view
      } else if (newState.documentId && newState.documentId !== oldState.documentId) {
        console.log('render preview now');
        this.renderPreview();
      }
    }
  };

  this.renderPreview = function() {
    this.previewView = new PreviewView(this.controller.previewData);
    this.previewEl.innerHTML = "";
    this.previewEl.appendChild(this.previewView.render().el);
  };

  // Display initial search result
  this.renderSearchResult = function() {

    // Check if there's an actual search result
    if (!this.controller.searchResult) return;

    this.documentsEl.innerHTML = "";

    // Hide loading indicator
    this.hideLoading();

    // highlight previewed document
    var documentId = this.controller.state.documentId;

    // Get filtered documents
    var documents = this.controller.searchResult.getDocuments();

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
              children: [$$('a', {href: '#', html: doc.title})]
            }),
            $$('.authors', {
              children: authors
            }),
            // $$('.intro', {text: doc.intro}),
            // categoriesEl
          ]
        });

        this.documentsEl.appendChild(documentEl);
      }, this);
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
