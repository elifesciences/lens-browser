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
      console.log('filter', filterValues);
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

  // this.addFilter = function(facetName, value) {
  //   // Implicitly remove a filter if already set
  //   if (this.isSelected(facetName, value)) {
  //     this.filters[facetName] = _.without(this.filters[facetName], value);
      
  //     if (this.filters[facetName].length === 0) {
  //       delete this.filters[facetName];
  //     }
  //   } else {
  //     // Add new filter
  //     if (!this.filters[facetName]) {
  //       this.filters[facetName] = [];
  //     }

  //   }
  //   this.filterDocuments();
  // };

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

  // Get available facets
  // ------------
  // 
  // More verbose representation of all available facets
  // used by the browser view

  this.getAvailableFacets = function() {
    var availableFacets = [];
    _.each(this.facets, function(facet, key) {
      var richValues = [];
      var values = Object.keys(facet);

      _.each(values, function(val) {
        richValues.push({
          frequency: facet[val].length,
          name: val,
          selected: this.isSelected(key, val)
        });
      }, this);

      availableFacets.push({
        property: key,
        name: AVAILABLE_FACETS[key],
        values: richValues
      });
    }, this);
    return availableFacets;
  };
};

SearchResult.prototype = new SearchResult.Prototype();

module.exports = SearchResult;