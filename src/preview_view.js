"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// PreviewView
// ========
//

var PreviewView = function(model, options) {
  View.call(this);

  this.model = model;

  // Elements
  // --------

  this.$el.addClass('preview');
};

PreviewView.Prototype = function() {

  // Rendering
  // ==========================================================================
  //

  this.render = function() {
    this.renderPreview();
    return this;
  };

  this.renderPreview = function() {
    this.el.innerHTML = "";  
    var fragmentsEl = $$('.fragments');

    // if (this.model.fragments.length > 0) {
    //   var fragmentsIntroEl = $$('.intro', {html: this.model.fragments.length+' matches for "'+this.model.searchStr+'"'});
    //   fragmentsEl.appendChild(fragmentsIntroEl);
    // } else {
    //   var fragmentsIntroEl = $$('.intro', {html: 'No matches found'});
    //   fragmentsEl.appendChild(fragmentsIntroEl);
    // }

    _.each(this.model.fragments, function(fragment) {
      fragmentsEl.appendChild($$('.fragment', {
        children: [
          $$('.separator'),
          $$('.content', {html: fragment.content}),
          // $$('.links', {
          //   children: [
          //     $$('a', { href: this.model.document.url+"#content/"+fragment.id, html: '<i class="fa fa-external-link-square"></i> Read more', target: '_blank' })
          //   ]
          // })
        ]
      }));
    }, this);

    this.el.appendChild(fragmentsEl);
  };


  this.dispose = function() {
    this.stopListening();
  };
};

// Export
// --------

PreviewView.Prototype.prototype = View.prototype;
PreviewView.prototype = new PreviewView.Prototype();

module.exports = PreviewView;