"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// Browser.View Constructor
// ========
//

var BrowserView = function(controller) {
  View.call(this);

  this.controller = controller;
  this.$el.attr({id: "container"});

  // Handle state transitions
  // --------

  this.listenTo(this.controller, 'state-changed', this.onStateChanged);
};

BrowserView.Prototype = function() {

  // Session Event handlers
  // --------
  //

  this.onStateChanged = function() {
    var state = this.controller.state;
    if (state.context === "browser") {
      this.openBrowser();
    } else {
      console.log("Unknown application state: " + state);
    }
  };

  // Open the reader view
  // ----------
  //

  this.openBrowser = function() {
    var view = this.controller.browser.createView();
    var that = this;

    that.replaceMainView('browser', view);
  };

  // Rendering
  // ==========================================================================
  //

  this.replaceMainView = function(name, view) {
    $('body').removeClass().addClass('current-view '+name);

    if (this.mainView && this.mainView !== view) {
      this.mainView.dispose();
    }

    this.mainView = view;
    this.$('#main').html(view.render().el);
  };

  this.render = function() {
    this.el.innerHTML = "";

    // Main container
    // ------------

    this.el.appendChild($$('#main'));
    return this;
  };

  this.dispose = function() {
    this.stopListening();
    if (this.mainView) this.mainView.dispose();
  };
};


// Export
// --------

BrowserView.Prototype.prototype = View.prototype;
BrowserView.prototype = new BrowserView.Prototype();

module.exports = BrowserView;