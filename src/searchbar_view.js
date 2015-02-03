"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// SearchbarView Constructor
// ========
//

var SearchbarView = function(controller) {
  View.call(this);

  this.controller = controller;

  // Elements
  // --------

  this.$el.addClass('searchbar');
  this.searchFieldEl = $$('.search-field');
  
  // Filters
  this.searchFieldFilters = $$('.search-field-filters');
  this.searchFieldEl.appendChild(this.searchFieldFilters);

  this.searchFieldInputEl = $$('input.search-field-input', {type: "text"});
  this.searchFieldEl.appendChild(this.searchFieldInputEl);

  // Suggestions
  this.searchFieldSuggestionsEl = $$('.search-field-suggestions');
  this.searchFieldEl.appendChild(this.searchFieldSuggestionsEl);

  // Search button
  this.el.appendChild(this.searchFieldEl);
  this.searchButton = $$('a.search-button' , {href: "#", text: 'Search'});
  this.el.appendChild(this.searchButton);

  // Event handlers
  // ------------

  $(this.searchFieldInputEl).keyup(_.bind(this._updateSuggestions, this));
  $(this.searchFieldInputEl).focus(_.bind(this._updateSuggestions, this));
  $(this.searchFieldInputEl).blur(_.bind(this._hideSuggestions, this));

  $(this.el).click(_.bind(this._hideSuggestions, this));

  this.$el.on('click', '.search-field-suggestion', _.bind(this._addFilter, this));

  // this.$el.on('click', '.toggle-preview', _.bind(this.togglePreview, this));
};


SearchbarView.Prototype = function() {

  // Session Event handlers
  // --------
  //

  // this.startSearch = function(e) {
  //   e.preventDefault();
  //   var searchstr = $(this.searchFieldEl).val();
  //   if (searchstr) {
  //     this.controller.switchState({
  //       id: "main",
  //       searchstr: searchstr
  //     });
  //   }
  // };

  this._updateSuggestions = function(e) {
    var searchStr = $(e.currentTarget).val();
    // console.log('YO key up', value);
    this.renderSuggestions(searchStr);
  };

  // Delay a bit so click handlers can be triggered on suggested elements
  this._hideSuggestions = function(e) {
    // var el = this.searchFieldSuggestionsEl;
    // _.delay(function() {
    //   $(el).hide();
    // }, 200, this);
  };

  this._addFilter = function(e) {
    var $el = $(e.currentTarget);
    var facet = $el.attr('data-facet');
    var value = $el.attr('data-value');
    console.log('adding filter', facet, value);
    e.preventDefault();
  };


  // Rendering
  // ==========================================================================
  //

  this.render = function() {
    // this.el.innerHTML = "";
    // this.el.appendChild(this.searchbarEl);  
    // this.el.appendChild(this.panelWrapperEl);

    this.renderFilters();
    this.renderSuggestions();
    return this;
  };

  // Render currently chosen filters
  // ------------------

  this.renderFilters = function() {
    var filters = this.controller.getFilters();
    this.searchFieldFilters.innerHTML = "";
    _.each(filters, function(filter) {
      var filterEl = $$('.search-field-filter', {text: filter.value});
      this.searchFieldFilters.appendChild(filterEl);
    }, this);
  };

  // Render suggestions
  // ------------------

  this.renderSuggestions = function(searchStr) {
    var suggestions = this.controller.getSuggestions(searchStr);
    this.searchFieldSuggestionsEl.innerHTML = "";
    _.each(suggestions, function(suggestion) {
      var suggestionEl = $$('a.search-field-suggestion', {
        html: suggestion.value,
        href: "#",
        "data-value": suggestion.rawValue,
        "data-facet": suggestion.facet
      });
      this.searchFieldSuggestionsEl.appendChild(suggestionEl);
    }, this);

    $(this.searchFieldSuggestionsEl).show();
  };

  this.dispose = function() {
    this.stopListening();
  };
};

// Export
// --------

SearchbarView.Prototype.prototype = View.prototype;
SearchbarView.prototype = new SearchbarView.Prototype();

module.exports = SearchbarView;