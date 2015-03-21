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

        var frequency = facetEntry.frequency;
        var scopedFrequency = facetEntry.scoped_frequency;
        var percentage = (scopedFrequency*100)/frequency;

        var facetValueEl = $$('a.value'+(facetEntry.selected ? '.selected' : '')+(scopedFrequency == 0 ? '.not-included' : ''), {
          href: "#",
          "data-facet": facet.property,
          "data-value": facetEntry.name,
          "children": [
            // $$('.label', {html: '<i class="fa '+icon+'"></i> '+label}),
            $$('.icon', {html: '<i class="fa '+icon+'"></i>'}),
            $$('.label', {html: label}),
            $$('.frequency',{
              children: [
                $$('.scoped-frequency-label', {text: facetEntry.scoped_frequency}),
                $$('.total-frequency-label', {text: facetEntry.frequency}),
                $$('.total-frequency-bar'),
                $$('.scoped-frequency-bar', {
                  style: "width: "+percentage+"%"
                })
              ]
            })
          ]
        });

        facetValuesEl.appendChild(facetValueEl);
      }, this);

      facetEl.appendChild(facetValuesEl);
      this.availableFacets.appendChild(facetEl);
    }, this);
    
    this.el.appendChild(this.availableFacets);

    // this.$('.facet.authors .facet-values').append($('<a class="show-more" href="#">Show 20 more</a>'));
    // this.updateFrequency();
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