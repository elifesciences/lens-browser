"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// SearchbarView Constructor
// ========
//

var SearchbarView = function(controller) {
  View.call(this);

  this.controller = controller;

  // Elements
  // --------

  // Search bar
  // ------------


  this.$el.addClass('searchbar');

  // this.searchbarEl = $$('#searchbar', {html: ''});
  this.searchFieldEl = $$('input.search-field', {type: "text"});
  this.el.appendChild(this.searchFieldEl);
  this.searchButton = $$('a.search-button' , {href: "#", text: 'Search'});
  this.el.appendChild(this.searchButton);


  // Event handlers
  // ------------

  // $(this.searchButton).click(_.bind(this.startSearch, this));
  // $(this.searchFieldEl).change(_.bind(this.startSearch, this));
  // this.$el.on('click', '.value', _.bind(this.toggleFilter, this));
  // this.$el.on('click', '.toggle-preview', _.bind(this.togglePreview, this));
};


SearchbarView.Prototype = function() {

  // Session Event handlers
  // --------
  //

  // this.startSearch = function(e) {
  //   e.preventDefault();
  //   var searchstr = $(this.searchFieldEl).val();
  //   if (searchstr) {
  //     this.controller.switchState({
  //       id: "main",
  //       searchstr: searchstr
  //     });
  //   }
  // };


  // Rendering
  // ==========================================================================
  //

  this.render = function() {
    // this.el.innerHTML = "";
    // this.el.appendChild(this.searchbarEl);  
    // this.el.appendChild(this.panelWrapperEl);
    return this;
  };

  this.dispose = function() {
    this.stopListening();
  };
};

// Export
// --------

SearchbarView.Prototype.prototype = View.prototype;
SearchbarView.prototype = new SearchbarView.Prototype();

module.exports = SearchbarView;