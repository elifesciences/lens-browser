var _ = require("underscore");

// Search Result
// =============================
// 
// An model abstraction for the search result that the controller can operate on

var AVAILABLE_FACETS = require("./available_facets");

var LABEL_MAPPING = {
  subjects: "Subjects",
  article_type: "Article Type",
  organisms: "Organisms",
  authors: "Top Authors"
};

var SearchResult = function(data) {
  this.rawResult = data.result;
  this.searchQuery = data.searchQuery;
};

SearchResult.Prototype = function() {

  this.getSearchMetrics = function() {
    return {
      hits: this.rawResult.hits.total
    };
  };

  // Set of documents according to search result and set filters
  // ------------

  this.getDocuments = function() {
    var documents = [];
    _.each(this.rawResult.hits.hits, function(rawDoc) {
      var doc = JSON.parse(JSON.stringify(rawDoc._source));
      documents.push(_.extend(doc, {
        id: rawDoc._id,
        fragments: rawDoc.fragments,
        _score: rawDoc._score,
        title: rawDoc.highlight && rawDoc.highlight.title ? rawDoc.highlight.title[0] : rawDoc._source.title,
        authors_string: rawDoc.highlight && rawDoc.highlight.authors_string ? rawDoc.highlight.authors_string[0] : rawDoc._source.authors_string,
        intro: rawDoc.highlight && rawDoc.highlight.intro ? rawDoc.highlight.intro[0] : rawDoc._source.intro,
        doi: rawDoc.highlight && rawDoc.highlight.doi ? rawDoc.highlight.doi[0] : rawDoc._source.doi,
      }));
    });
    return documents;
  };

  this.getScopedFrequency = function(facet, value) {
    var facet = this.rawResult.aggregations[facet];

    if (!facet) return "0";
    var bucket = _.select(facet.buckets, function(bucket) {
      return bucket.key === value;
    });

    return bucket.length > 0 ? bucket[0].doc_count : "0";
  };

  this.getFacets = function() {
    var facets = [];
    var self = this;
    var aggregations = this.rawResult.aggregations;

    // console.log(JSON.stringify(this.rawResult.aggregations, null, "  "));

    _.each(LABEL_MAPPING, function(label, property) {
      var entries = [];

      if (AVAILABLE_FACETS[property]) {
        _.each(AVAILABLE_FACETS[property].buckets, function(bucket) {
          entries.push({
            name: bucket.key,
            frequency: bucket.doc_count,
            scoped_frequency: self.getScopedFrequency(property, bucket.key),
            selected: self.isSelected(property, bucket.key)
          });
        });
      } else if (property === "authors") {
        _.each(aggregations["authors"].buckets, function(bucket) {
          entries.push({
            name: bucket.key,
            frequency: bucket.doc_count,
            scoped_frequency: self.getScopedFrequency(property, bucket.key),
            selected: self.isSelected(property, bucket.key)
          });
        });
      }

      facets.push({
        name: label,
        property: property,
        entries: entries
      });
    });

    return facets;
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
