"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// FacetsView
// ========
//

var FacetsView = function(facets, options) {
  View.call(this);

  this.facets = facets;
  this.$el.addClass('facets');
};

FacetsView.Prototype = function() {

  // Rendering
  // ==========================================================================
  //

  this.render = function() {
    this.el.innerHTML = "";
    this.renderFacets();
    return this;
  };

  this.renderFacets = function() {
    this.availableFacets = $$('.available-facets');
    

    // Render facets
    _.each(this.facets, function(facet) {
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

        facetValuesEl.appendChild(facetValueEl);
      }, this);

      facetEl.appendChild(facetValuesEl);
      this.availableFacets.appendChild(facetEl);
    }, this);
    
    this.el.appendChild(this.availableFacets);
    // this.highlightFacets();
  };


  this.dispose = function() {
    this.stopListening();
  };

};

// Export
// --------

FacetsView.Prototype.prototype = View.prototype;
FacetsView.prototype = new FacetsView.Prototype();

module.exports = FacetsView;