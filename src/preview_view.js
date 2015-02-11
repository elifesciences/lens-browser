"use strict";

var _ = require("underscore");
var View = require("substance-application").View;
var $$ = require("substance-application").$$;

// PreviewView
// ========
//

var PreviewView = function(searchQuery, options) {
  View.call(this);

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
    this.previewEl.innerHTML = "";

    var previewData = this.controller.previewData;
    if (!previewData) return;

    // Details container
    var detailsEl = $$('.details');

    var publishDateEl = $$('.published-on', {
      html: new Date(previewData.document.published_on).toDateString()
    });

    detailsEl.appendChild(publishDateEl);

    var documentId = this.controller.state.documentId;

    var titleEl = $$('.title', {
      html: previewData.document.title
    });

    detailsEl.appendChild(titleEl);
    var authorsEl = $$('.authors', {html: previewData.document.authors.join(', ') });
    detailsEl.appendChild(authorsEl);

    var linksEl = $$('.links', {
      children: [
        $$('a', {href: previewData.document.url, html: '<i class="fa fa-external-link-square"></i> Open in Lens', target: '_blank'}),
        $$('a', {href: previewData.document.pdf_url, html: '<i class="fa fa-file-pdf-o"></i> PDF', target: '_blank'})
      ]
    });

    detailsEl.appendChild(linksEl);
    this.previewEl.appendChild(detailsEl);
  
    var fragmentsEl = $$('.fragments');

    if (previewData.fragments.length > 0) {
      var fragmentsIntroEl = $$('.intro', {html: previewData.fragments.length+' matches for "'+this.controller.state.searchstr+'"'});
      fragmentsEl.appendChild(fragmentsIntroEl);      
    }

    _.each(previewData.fragments, function(fragment) {
      fragmentsEl.appendChild($$('.fragment', {
        children: [
          $$('.content', {html: fragment.content}),
          $$('.links', {
            children: [
              $$('a', {href: previewData.document.url+"#content/"+fragment.id, html: '<i class="fa fa-external-link-square"></i> Read more', target: '_blank'})
            ]
          })
        ]
      }));
    }, this);

    this.previewEl.appendChild(fragmentsEl);
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