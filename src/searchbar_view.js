"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

var ICON_MAPPING = {
  "subjects": "fa-tags",
  "article_type": "fa-align-left"
};

// SearchbarView Constructor
// ========
//

var SearchbarView = function(searchQuery, options) {
  View.call(this);

  // Model contains the search query
  this.searchQuery = searchQuery;

  // Elements
  // --------

  this.$el.addClass('searchbar');
  this.searchFieldEl = $$('.search-field');
  
  // Filters
  this.searchFieldFilters = $$('.search-field-filters');
  this.searchFieldEl.appendChild(this.searchFieldFilters);

  this.searchFieldInputEl = $$('input.search-field-input', {type: "text", placeholder: "Search or add filters"});
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

  // $(this.searchFieldInputEl).keyup(_.bind(this._updateSuggestions, this));
  
  // $(this.searchFieldInputEl).keydown(_.bind(this._interpretKey, this));
  // $(this.searchFieldInputEl).focus(_.bind(this._updateSuggestions, this));

  // $(this.searchFieldInputEl).blur(_.bind(this._hideSuggestions, this));

  // $(this.el).click(_.bind(this._hideSuggestions, this));
  // this.$el.on('click', '.search-field-suggestion', _.bind(this._addFilter, this));

  this.$el.on('click', '.remove-filter', _.bind(this._removeFilter, this));

  $(this.searchFieldInputEl).change(_.bind(this._updateSearchStr, this));

  this.searchQuery.on('query:changed', _.bind(this.updateView, this));
};

SearchbarView.Prototype = function() {

  this._updateSearchStr = function(e) {
    var searchStr = $(e.currentTarget).val();

    this.searchQuery.updateSearchStr(searchStr);

    e.preventDefault();
    console.log('updating searchstr');
  };

  this._removeFilter = function(e) {
    e.preventDefault();
    var facet = $(e.currentTarget).attr("data-facet");
    var filterVal = $(e.currentTarget).attr("data-value");
    console.log('removing filter...', facet, filterVal);
    this.searchQuery.removeFilter(facet, filterVal);
  };

  // Event handlers
  // --------
  //

  // this._interpretKey = function(e) {
  //   var searchStr = $(e.currentTarget).val();
  //   if (e.keyCode === 8 && searchStr === "") {
  //     this.controller.removeLastFilter();
  //     this.trigger('search:changed');
  //     this.renderFilters();
  //   } else {
  //     if (e.keyCode === 40) {
  //       // arrow down
  //       console.log('arrow down');
  //       this.nextSuggestion();
  //       e.preventDefault();
  //     } else if (e.keyCode === 38) {
  //       // arrow up
  //       console.log('arrow up');
  //       this.prevSuggestion();
  //       e.preventDefault();
  //     } else if (e.keyCode === 13) {
  //       console.log('choose suggestion');
  //       this.chooseSuggestion();
  //     }
  //   }
  // };

  // this._updateSuggestions = function(e) {
  //   var searchStr = $(e.currentTarget).val();

  //   // ignore keyup/keydown/enter
  //   if (_.include([40, 38, 13],e.keyCode)) return;

  //   this.renderSuggestions(searchStr);
  // };

  // this.setSearchData = function(data) {
  //   this.controller.searchstr = data.searchstr;
  //   if (data.searchFilters) {
  //     this.controller.filters = data.searchFilters;
  //     this.renderFilters();
  //   }

  //   $(this.searchFieldInputEl).val(this.controller.searchstr);
  // };

  // this.getSearchData = function() {
  //   return {
  //     searchStr: $(this.searchFieldInputEl).val(),
  //     filters: this.controller.getFilters()
  //   }
  // };

  // Delay a bit so click handlers can be triggered on suggested elements
  // this._hideSuggestions = function(e) {
  //   var el = this.searchFieldSuggestionsEl;
  //   // $(el).hide();

  //   _.delay(function() {
  //     $(el).hide();
  //   }, 200, this);
  // };

  // this._addFilter = function(e) {
  //   var $el = $(e.currentTarget);
  //   var facet = $el.attr('data-facet');
  //   var value = $el.attr('data-value');

  //   this.controller.addFilter(facet, value);
  //   this.renderFilters();
  //   this._hideSuggestions();
  //   // reset searchfield
  //   $(this.searchFieldInputEl).val('').focus();
  //   e.preventDefault();
  //   this.trigger('search:changed');
  // };

  // this.chooseSuggestion = function() {
  //   // when enter has been pressed
  //   var $activeSuggestion = this.$('.search-field-suggestion.active');

  //   if ($activeSuggestion.length > 0) {
  //     $activeSuggestion.trigger('click');
  //   } else {
  //     this.trigger('search:changed');
  //     this._hideSuggestions();
  //   }
  // };

  // Rendering
  // ==========================================================================
  //

  this.render = function() {
    this.renderFilters();
    // this.renderSuggestions();
    return this;
  };

  // Render currently chosen filters
  // ------------------

  // this.renderFilters = function() {
  //   var filters = this.controller.getFilters();

  //   this.searchFieldFilters.innerHTML = "";
  //   _.each(filters, function(filter) {
  //     var filterEl = $$('.search-field-filter', {
  //       html: '<i class="fa '+ICON_MAPPING[filter.facet]+'"></i> '+ filter.value
  //     });

  //     this.searchFieldFilters.appendChild(filterEl);
  //   }, this);
  // };

  this.renderFilters = function() {
    console.log('filters', this.searchQuery.filters);
    // var filters = this.controller.getFilters();

    this.searchFieldFilters.innerHTML = "";
    _.each(this.searchQuery.filters, function(filterValues, facet) {
      _.each(filterValues, function(filterVal) {
        var filterEl = $$('.search-field-filter', {
          html: '<i class="fa '+ICON_MAPPING[facet]+'"></i> '+ filterVal +' <a href="#" class="remove-filter" data-facet="'+facet+'" data-value="'+filterVal+'">x</a>'
        });
        this.searchFieldFilters.appendChild(filterEl);
      }, this);
    }, this);
    
    // _.each(filters, function(filter) {
    //   var filterEl = $$('.search-field-filter', {
    //     html: '<i class="fa '+ICON_MAPPING[filter.facet]+'"></i> '+ filter.value
    //   });

    //   this.searchFieldFilters.appendChild(filterEl);
    // }, this);
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

  // TODO: find simpler implementation

  // this.prevSuggestion = function() {
  //   var suggestionEls = this.searchFieldSuggestionsEl.childNodes;

  //   if (suggestionEls.length > 0) {
  //     var $activeEl = this.$('.search-field-suggestion.active');
  //     if ($activeEl.length === 0) {
  //       // select last element
  //       $(_.last(suggestionEls)).addClass('active');
  //     } else {
  //       $activeEl.removeClass('active');
  //       $activeEl.prev().addClass('active');
  //     }
  //   }
  // };

  // this.nextSuggestion = function() {
  //   var suggestionEls = this.searchFieldSuggestionsEl.childNodes;

  //   if (suggestionEls.length > 0) {
  //     var $activeEl = this.$('.search-field-suggestion.active');
  //     if ($activeEl.length === 0) {
  //       // select first element
  //       $(suggestionEls[0]).addClass('active');
  //     } else {
  //       $activeEl.removeClass('active');
  //       $activeEl.next().addClass('active');
  //     }
  //   }
  // };

  // Render suggestions
  // ------------------

  // this.renderSuggestions = function(searchStr) {
  //   var suggestions = this.controller.getSuggestions(searchStr);
  //   this.searchFieldSuggestionsEl.innerHTML = "";
  //   _.each(suggestions, function(suggestion) {
  //     var suggestionEl = $$('a.search-field-suggestion', {
  //       html: '<i class="fa '+ICON_MAPPING[suggestion.facet]+'"></i> '+ suggestion.value,
  //       href: "#",
  //       "data-value": suggestion.rawValue,
  //       "data-facet": suggestion.facet
  //     });
  //     this.searchFieldSuggestionsEl.appendChild(suggestionEl);
  //   }, this);

  //   $(this.searchFieldSuggestionsEl).show();
  // };

  this.dispose = function() {
    this.stopListening();
  };
};


// Export
// --------

SearchbarView.Prototype.prototype = View.prototype;
SearchbarView.prototype = new SearchbarView.Prototype();

module.exports = SearchbarView;