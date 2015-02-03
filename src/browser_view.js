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

  this.searchbarView = this.controller.searchbarCtrl.createView();

  // List of found documents
  // ------------
  // 
  // Left floated 60%

  this.facetsEl = $$('#facets');
  this.documentsEl = $$('#documents');

  this.previewEl = $$('#preview', {
    
  });

  // Wrap what we have into a panel wrapper
  this.panelWrapperEl = $$('.panel-wrapper');

  this.panelWrapperEl.appendChild(this.facetsEl);
  this.panelWrapperEl.appendChild(this.documentsEl);
  this.panelWrapperEl.appendChild(this.previewEl);

  // Event handlers
  // ------------

  $(this.searchButton).click(_.bind(this.startSearch, this));
  $(this.searchFieldEl).change(_.bind(this.startSearch, this));
  this.$el.on('click', '.value', _.bind(this.toggleFilter, this));
  this.$el.on('click', '.toggle-preview', _.bind(this.togglePreview, this));
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

  this.togglePreview = function(e) {
    e.preventDefault();

    var documentId = $(e.currentTarget).parent().attr('data-id');
    var filters = this.controller.searchResult.filters;

    // Update state
    this.controller.switchState({
      id: "main",
      searchstr: this.controller.state.searchstr,
      documentId: documentId,
      filters: JSON.stringify(filters)
    });

    // var searchStr = this.controller.state.searchstr;
    // this.controller.loadPreview(documentId, function(err, preview) {
    //   console.log('preview', preview);
    // });
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
  // --------------

  this.afterTransition = function(oldState, newState) {
    console.log('after transition');
    if (newState.id === "main") {
      $(this.searchFieldEl).attr({value: newState.searchstr});

      if (newState.searchstr) {
        this.renderSearchResult();
        // if the search has not changed then 'likely' the filter has
        // TODO: could be detected more explicitly
        // if (oldState.searchstr === newState.searchstr) {
        //   console.log('filters have been changed...');
        //   this.renderSearchResult();
        // }
      } else {
        // TODO: render 'moderated' list of documents
        alert('no search string specified');
      }
    }
  };

  // Clear element registry
  // --------------

  this.clearElementRegistry = function() {
    this.elementIndex = {};
  };

  // Register DOM element in element registry for easy lookup by key later
  this.registerElement = function(facetName, value, el) {
    if (!this.elementIndex[facetName]) {
      this.elementIndex[facetName] = {};
    };

    if (!this.elementIndex[facetName][value]) {
      this.elementIndex[facetName][value] = [];
    }
    this.elementIndex[facetName][value].push(el);
  };

  // Get DOM element from element registry
  this.getElements = function(facetName, value) {
    if (!this.elementIndex[facetName]) return null;
    return this.elementIndex[facetName][value];
  };

  // Display initial search result
  this.renderSearchResult = function() {
    this.documentsEl.innerHTML = "";

    // highlight previewed document
    var documentId = this.controller.state.documentId;
    // console.log('meh', this.$('.document[data-id='+documentId+']'));

    // Clear element index
    this.clearElementRegistry();

    // Get filtered documents
    var documents = this.controller.searchResult.getDocuments();

    _.each(documents, function(doc) {
      var authors = [];

      _.each(doc.authors, function(author) {
        var authorEl = $$('span.author.facet-occurence', {text: author});
        this.registerElement("authors", author, authorEl);
        authors.push(authorEl);
      }, this);

      var categoriesEl = $$('.categories');
      var articleTypeEl = $$('.article_type.facet-occurence', {text: doc.article_type });
      categoriesEl.appendChild(articleTypeEl);
      this.registerElement("article_type", doc.article_type, articleTypeEl);

      // Iterate over subjects and display
      _.each(doc.subjects, function(subject) {
        var subjectEl = $$('.subjects.facet-occurence', {text: subject});
        categoriesEl.appendChild(subjectEl);
        this.registerElement("subjects", subject, subjectEl);
      }, this);

      var documentEl = $$('.document', {
        "data-id": doc.id,
        children: [
          $$('a.toggle-preview', {href: '#', html: '<i class="fa fa-eye"></i> Preview'}),
          $$('.title', {
            children: [$$('a', {href: '#', html: doc.title})]
          }),
          $$('.authors', {
            children: authors
          }),
          $$('.intro', {text: doc.intro}),
          categoriesEl,
          $$('.published-on', {text: new Date(doc.published_on).toDateString() })
        ]
      });

      if (documentId === doc.id) {
        documentEl.classList.add("active");
      }

      this.documentsEl.appendChild(documentEl);
    }, this);
  
    this.renderFacets();
    this.renderPreview();
  };

  this.renderFacets = function() {
    this.facetsEl.innerHTML = "";

    this.availableFacets = $$('.available-facets');
    this.facetsEl.appendChild(this.availableFacets);

    var facets = this.controller.searchResult.getAvailableFacets();

    // Render facets
    _.each(facets, function(facet) {
      var facetEl = $$('.facet.'+facet.property);

      // Filter name
      facetEl.appendChild($$('.facet-name', { text: facet.name }));
      var facetValuesEl = $$('.facet-values');

      // Filter values + frequency in doc corpus
      _.each(facet.values, function(facetValue) {
        var facetValueEl = $$('a.value'+(facetValue.selected ? '.selected' : ''), {
          href: "#",
          "data-facet": facet.property,
          "data-value": facetValue.name,
          text: facetValue.name + " ("+facetValue.frequency+")"
        });

        // this.registerElement(facet.property, facetValue.name);
        facetValuesEl.appendChild(facetValueEl);
      }, this);

      facetEl.appendChild(facetValuesEl);
      this.availableFacets.appendChild(facetEl);
    }, this);

    this.highlightFacets();
  };

  // Highlight currently filtered facets
  this.highlightFacets = function() {
    $('.facet-occurence.highighted').removeClass('highighted');

    var filters = this.controller.searchResult.filters;
    _.each(filters, function(facetValues, facetName) {      
      _.each(facetValues, function(val) {
        var els = this.getElements(facetName, val);
        $(els).addClass('highlighted');
      }, this);
    }, this);
  };

  this.renderPreview = function() {
    this.previewEl.innerHTML = "";

    var previewData = this.controller.previewData;
    if (!previewData) return;
    console.log('rendering previewData', previewData);

    _.each(previewData.fragments, function(fragment) {
      this.previewEl.appendChild($$('.fragment', {
        html: fragment.content
      }));
    }, this);
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