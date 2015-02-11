var _ = require("underscore");

// Search Result
// =============================
// 
// An model abstraction for the search result that the controller can operate on

var AVAILABLE_FACETS = {
  "article_type": "Article Type",
  "subjects": "Subjects",
  "authors": "Authors"
};

var SearchResult = function(res, filters) {
  this.documents = res.documents;
  this.filteredDocuments = null;
  this.facets = {}; // extracted facets from the document list
  this.filters = filters;

  this.computeFacets();
  this.filterDocuments();
};

SearchResult.Prototype = function() {

  // Take current set filters and determine matching documents
  // ------------

  this.filterDocuments = function() {
    this.filteredDocuments = [];

    if (!this.filters || Object.keys(this.filters).length === 0) {
      this.filteredDocuments = null;
      return;
    }

    _.each(this.filters, function(filterValues, filterName) {
      _.each(filterValues, function(val) {
        var matches = this.facets[filterName][val];
        this.filteredDocuments = _.union(this.filteredDocuments, matches);
      }, this);
    }, this);
  };

  // Apply new filters and recompute document list according to filters
  // ------------

  this.applyFilters = function(newFilters) {
    this.filters = newFilters;
    this.filterDocuments();
  };


  // Set of documents according to search result and set filters
  // ------------

  this.getDocuments = function() {
    return this.filteredDocuments || this.documents;
  };

  // Get current facets
  // ------------

  this.computeFacets = function() {
    // Initialize facets data structure
    _.each(AVAILABLE_FACETS, function(label, facetName) {
      this.facets[facetName] = {};
    }, this);

    // Iterate over all docs from result set
    _.each(this.documents, function(doc) {

      // Build index for each facet value
      _.each(AVAILABLE_FACETS, function(label, facetName) {
        var values = doc[facetName];
        if (!_.isArray(values)) values = [values];

        // Track each facet value and maintain reference to documents that have that value
        _.each(values, function(val) {
          var facet = this.facets[facetName];

          if (facet[val]) {
            // Push to existing entry
            facet[val].push(doc);
          } else {
            // Create new entry
            facet[val] = [ doc ];
          }
        },this);
      }, this);
    }, this);
  };

  // Returns true when a given facet value is set as a filter
  // ------------

  this.isSelected = function(facetName, value) {
    var filter = this.filters[facetName];
    if (!filter) return false;
    return filter.indexOf(value) >= 0;
  };


};

SearchResult.prototype = new SearchResult.Prototype();

module.exports = SearchResult;
