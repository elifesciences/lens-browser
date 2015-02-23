var _ = require("underscore");

// Search Result
// =============================
// 
// An model abstraction for the search result that the controller can operate on

var AVAILABLE_FACETS = require("./available_facets");


var SearchResult = function(res) {
  this.documents = res.documents;

  // Contains searchStr and filters
  this.searchQuery = res.searchQuery;
  this.facets = {}; // extracted facets from the document list
  this.computeFacets();
};

SearchResult.Prototype = function() {

  // Set of documents according to search result and set filters
  // ------------

  this.getDocuments = function() {
    return this.documents;
  };

  // Get current facets
  // ------------

  this.computeFacets = function() {
    // Initialize facets data structure
    _.each(AVAILABLE_FACETS, function(facet, facetName) {
      this.facets[facetName] = {};
    }, this);

    // Iterate over all docs from result set
    _.each(this.documents, function(doc) {

      // Build index for each facet value
      _.each(AVAILABLE_FACETS, function(facet, facetName) {
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

  // Get available facets
  // ------------
  // 
  // More verbose representation of all available facets
  // used by the browser view

  this.getAvailableFacets = function() {
    var availableFacets = [];
    var localFacets = this.facets;

    _.each(AVAILABLE_FACETS, function(facet, key) {
      var richValues = [];

      _.each(facet.entries, function(entry) {
        var computedFacet = localFacets[key];

        var frequency = [entry.name];
        if (computedFacet[entry.name]) {
          frequency = computedFacet[entry.name].length;
        } else {
          frequency = entry.frequency;
        }

        richValues.push({
          frequency: frequency,
          name: entry.name,
          selected: this.isSelected(key, entry.name)
        });
      }, this);

      availableFacets.push({
        property: key,
        name: facet.name,
        entries: richValues
      });
    }, this);

    // TEMP: Use authors from local result
    var authorsFacet = this.facets["authors"];
    var values = Object.keys(authorsFacet);
    var richValues = [];

    _.each(values, function(val) {
      richValues.push({
        frequency: authorsFacet[val].length,
        name: val,
        selected: this.isSelected("authors", val)
      });
    }, this);

    availableFacets.pop();

    availableFacets.push({
      property: "authors",
      name: "Authors",
      entries: richValues.slice(0, 10)
    });

    return availableFacets;
  };

  // Returns true when a given facet value is set as a filter
  // ------------

  this.isSelected = function(facetName, value) {
    var filter = this.searchQuery.filters[facetName];
    if (!filter) return false;
    return filter.indexOf(value) >= 0;
  };
};

SearchResult.prototype = new SearchResult.Prototype();

module.exports = SearchResult;
