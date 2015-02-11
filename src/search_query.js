var _ = require("underscore");
var util = require("substance-util");

// Search Query Model
// =============================
// 
// An model abstraction for a search query, that is manipulated by a browser's searchbar

var SearchQuery = function(data, options) {
  this.searchStr = data.searchStr;
  this.filters = data.filters;
};

SearchQuery.Prototype = function() {

  this.addFilter = function(facet, value) {
    if (!this.filters[facet]) this.filters[facet] = [];
    this.filters[facet].push(value);
    this.trigger("query:changed");
  };

  this.removeFilter = function(facet, value) {
    var values = this.filters[facet];
    this.filters[facet] = _.without(values, value);
    this.trigger("query:changed");
  };

  this.updateSearchStr = function(searchStr) {
    this.searchStr = searchStr;
    this.trigger("query:changed");
  };

  // Set new query data without triggering a change
  this.setQuery = function(query) {
    this.searchStr = query.searchStr;
    this.filters = query.filters;
  };

  // Get plain JSON version of the query
  this.toJSON = function() {
    return {
      searchStr: this.searchStr,
      filters: this.filters
    };
  };
};

SearchQuery.Prototype.prototype = util.Events;
SearchQuery.prototype = new SearchQuery.Prototype();

module.exports = SearchQuery;
