"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

var ICON_MAPPING = {
  "subjects": "fa-tags",
  "article_type": "fa-align-left",
  "organisms": "fa-leaf"
};

// SearchbarView Constructor
// ========
//

var SearchbarView = function(searchQuery, options) {
  View.call(this);

  // Model contains the search query
  this.searchQuery = searchQuery;
  this.options = options;

  // Elements
  // --------

  this.$el.addClass('searchbar');
  this.searchFieldEl = $$('.search-field');
  

  // Filters
  this.searchFieldFilters = $$('.search-field-filters');
  this.searchFieldEl.appendChild(this.searchFieldFilters);

  this.searchFieldInputEl = $$('input.search-field-input', {type: "text", placeholder: "Enter search term"});
  this.searchFieldEl.appendChild(this.searchFieldInputEl);

  this.searchButton = $$('a.search-button' , {href: "#", text: 'Search'});
  this.searchFieldEl.appendChild(this.searchButton);

  // Suggestions
  this.searchFieldSuggestionsEl = $$('.search-field-suggestions');
  $(this.searchFieldSuggestionsEl).hide();

  this.searchFieldEl.appendChild(this.searchFieldSuggestionsEl);

  // Search button
  this.el.appendChild(this.searchFieldEl);
  
  // Event handlers
  // ------------

  $(this.searchFieldInputEl).keyup(_.bind(this._updateSuggestions, this));
  $(this.searchFieldInputEl).keydown(_.bind(this._interpretKey, this));
  $(this.searchFieldInputEl).blur(_.bind(this._hideSuggestions, this));

  $(this.el).click(_.bind(this._hideSuggestions, this));
  this.$el.on('click', '.search-field-suggestion', _.bind(this._useKeyword, this));

  this.$el.on('click', '.remove-filter', _.bind(this._removeFilter, this));
  this.$el.on('click', '.clear-filters', _.bind(this._clearFilters, this));

  $(this.searchFieldInputEl).change(_.bind(this._updateSearchStr, this));

  this.searchQuery.on('query:changed', _.bind(this.updateView, this));
};

SearchbarView.Prototype = function() {

  this._updateSearchStr = function(e) {
    var searchStr = $(this.searchFieldInputEl).val();
    this.searchQuery.updateSearchStr(searchStr);

    e.preventDefault();
    console.log('updating searchstr');
  };

  this._removeFilter = function(e) {
    e.preventDefault();
    var facet = $(e.currentTarget).attr("data-facet");
    var filterVal = $(e.currentTarget).attr("data-value");
    this.searchQuery.removeFilter(facet, filterVal);
  };

  this._clearFilters = function(e) {
    e.preventDefault();
    this.searchQuery.clearFilters();
  };

  // Event handlers
  // --------
  //

  this._interpretKey = function(e) {
    var searchStr = $(e.currentTarget).val();
    if (e.keyCode === 40) {
      // arrow down
      this.nextSuggestion();
      e.preventDefault();
    } else if (e.keyCode === 38) {
      // arrow up
      this.prevSuggestion();
      e.preventDefault();
    } else if (e.keyCode === 13) {
      this.chooseSuggestion();
    }
  };

  this._updateSuggestions = function(e) {
    var searchStr = $(e.currentTarget).val();

    // ignore keyup/keydown/enter
    if (_.include([40, 38, 13],e.keyCode)) return;
    this.renderSuggestions(searchStr);
  };

  // Delay a bit so click handlers can be triggered on suggested elements
  this._hideSuggestions = function(e) {
    var el = this.searchFieldSuggestionsEl;
    _.delay(function() {
      $(el).hide();
    }, 200, this);
  };

  this._useKeyword = function(e) {
    var $el = $(e.currentTarget);
    // var facet = $el.attr('data-facet');
    var value = $el.attr('data-value');

    // this.searchQuery.addFilter(facet, value);
    this._hideSuggestions();
    // reset searchfield
    $(this.searchFieldInputEl).val(value).focus();

    this._updateSearchStr(e);
    e.preventDefault();
  };

  this.chooseSuggestion = function() {
    // when enter has been pressed
    var $activeSuggestion = this.$('.search-field-suggestion.active');

    if ($activeSuggestion.length > 0) {
      $activeSuggestion.trigger('click');
    } else {
      this._hideSuggestions();
    }
  };

  // Rendering
  // ==========================================================================
  //

  this.render = function() {
    this.updateView();
    return this;
  };

  // Render currently chosen filters
  // ------------------

  this.renderFilters = function() {
    this.searchFieldFilters.innerHTML = "";

    var filterCount = 0;
    _.each(this.searchQuery.filters, function(filterValues, facet) {
      _.each(filterValues, function(filterVal) {
        var filterEl = $$('.search-field-filter', {
          html: filterVal
        });
        if (filterCount<3) {
          this.searchFieldFilters.appendChild(filterEl);  
        }
        filterCount += 1;
      }, this);
    }, this);

    if (filterCount>3) {
      var andMoreEl = $$('.search-field-filter', {text: "and "+(filterCount-3)+" more"});
      this.searchFieldFilters.appendChild(andMoreEl);
    }

    if (filterCount>0) {
      var clearFiltersEl = $$('.search-field-filter', {
        children: [$$('a.clear-filters', {href: "#", text: "Clear Filters"})]
      });
      this.searchFieldFilters.appendChild(clearFiltersEl);      
    }
  };

  // Update the current view according to new data
  // ------------------

  this.updateView = function() {
    console.log('query changed... updating the view');

    // Set search string
    $(this.searchFieldInputEl).val(this.searchQuery.searchStr);

    // Re-render filters
    this.renderFilters();
  };

  // TODO: find simpler implementation for keyboard nav

  this.prevSuggestion = function() {
    var suggestionEls = this.searchFieldSuggestionsEl.childNodes;

    if (suggestionEls.length > 0) {
      var $activeEl = this.$('.search-field-suggestion.active');
      if ($activeEl.length === 0) {
        // select last element
        $(_.last(suggestionEls)).addClass('active');
      } else {
        $activeEl.removeClass('active');
        $activeEl.prev().addClass('active');
      }
    }
  };

  this.nextSuggestion = function() {
    var suggestionEls = this.searchFieldSuggestionsEl.childNodes;

    if (suggestionEls.length > 0) {
      var $activeEl = this.$('.search-field-suggestion.active');
      if ($activeEl.length === 0) {
        // select first element
        $(suggestionEls[0]).addClass('active');
      } else {
        $activeEl.removeClass('active');
        $activeEl.next().addClass('active');
      }
    }
  };

  // Render suggestions
  // ------------------

  this.renderSuggestions = function(searchStr) {
    var suggestions = this.options.getSuggestions(searchStr);
    
    if (suggestions.length === 0) {
      $(this.searchFieldSuggestionsEl).hide();
      return;
    }

    this.searchFieldSuggestionsEl.innerHTML = "";
    _.each(suggestions, function(suggestion) {
      var suggestionEl = $$('a.search-field-suggestion', {
        html: '<i class="fa '+ICON_MAPPING[suggestion.facet]+'"></i> '+ suggestion.value,
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