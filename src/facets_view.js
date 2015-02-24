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
      _.each(facet.entries, function(facetEntry) {
        var icon;
        if (facetEntry.selected) {
          icon = 'fa-check-square-o';
        } else {
          icon = 'fa-square-o';
        }


        var label = facetEntry.name;
        if (facetEntry.frequency > 0) {
          label += ' ('+facetEntry.frequency+')';
        }

        var facetValueEl = $$('a.value'+(facetEntry.selected ? '.selected' : ''), {
          href: "#",
          "data-facet": facet.property,
          "data-value": facetEntry.name,
          html: '<i class="fa '+icon+'"></i> ' + label
        });

        facetValuesEl.appendChild(facetValueEl);
      }, this);

      facetEl.appendChild(facetValuesEl);
      this.availableFacets.appendChild(facetEl);
    }, this);
    
    this.el.appendChild(this.availableFacets);
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