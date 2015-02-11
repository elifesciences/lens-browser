"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// FacetsView
// ========
//

var PreviewView = function(searchQuery, options) {
  View.call(this);

  // Elements
  // --------

  this.$el.addClass('preview');
};

FacetsView.Prototype = function() {

  // Rendering
  // ==========================================================================
  //

  this.render = function() {
    return this;
  };

  // this.renderFacets = function() {
  //   this.facetsEl.innerHTML = "";

  //   this.availableFacets = $$('.available-facets');
  //   this.facetsEl.appendChild(this.availableFacets);

  //   var facets = this.controller.searchResult.getAvailableFacets();

  //   // Render facets
  //   _.each(facets, function(facet) {
  //     var facetEl = $$('.facet.'+facet.property);

  //     // Filter name
  //     facetEl.appendChild($$('.facet-name', { text: facet.name }));
  //     var facetValuesEl = $$('.facet-values');

  //     // Filter values + frequency in doc corpus
  //     _.each(facet.values, function(facetValue) {
  //       var facetValueEl = $$('a.value'+(facetValue.selected ? '.selected' : ''), {
  //         href: "#",
  //         "data-facet": facet.property,
  //         "data-value": facetValue.name,
  //         text: facetValue.name + " ("+facetValue.frequency+")"
  //       });

  //       // this.registerElement(facet.property, facetValue.name);
  //       facetValuesEl.appendChild(facetValueEl);
  //     }, this);

  //     facetEl.appendChild(facetValuesEl);
  //     this.availableFacets.appendChild(facetEl);
  //   }, this);

  //   this.highlightFacets();
  // };

  // Get available facets
  // ------------
  // 
  // More verbose representation of all available facets
  // used by the browser view

  // this.getAvailableFacets = function() {
  //   var availableFacets = [];
  //   _.each(this.facets, function(facet, key) {
  //     var richValues = [];
  //     var values = Object.keys(facet);

  //     _.each(values, function(val) {
  //       richValues.push({
  //         frequency: facet[val].length,
  //         name: val,
  //         selected: this.isSelected(key, val)
  //       });
  //     }, this);

  //     if (richValues.length > 1) {
  //       availableFacets.push({
  //         property: key,
  //         name: AVAILABLE_FACETS[key],
  //         values: richValues
  //       });        
  //     }

  //   }, this);
  //   return availableFacets;
  // };

  this.dispose = function() {
    this.stopListening();
  };

};

// Export
// --------

FacetsView.Prototype.prototype = View.prototype;
FacetsView.prototype = new FacetsView.Prototype();

module.exports = FacetsView;