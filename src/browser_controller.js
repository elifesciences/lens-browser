"use strict";

var _ = require("underscore");
var util = require("substance-util");
var Controller = require("substance-application").Controller;
var BrowserView = require("./browser_view");
var SearchResult = require("./search_result");
var SearchBarController = require("./searchbar_controller");


var EXAMPLE_SEARCHRESULT = [{"title":"High-order social interactions in groups of <span class=\"query-string\">mice</span>","authors":["Yair Shemesh","Yehezkel Sztainberg","Oren Forkosh","Tamar Shlapobersky","Alon Chen","Elad Schneidman"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-09-03","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00759","score":20.154352},{"title":"MicroRNA-146a acts as a guardian of the quality and longevity of hematopoietic stem cells in <span class=\"query-string\">mice</span>","authors":["Jimmy L Zhao","Dinesh S Rao","Ryan M O’Connell","Yvette Garcia-Flores","David Baltimore"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-05-21","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00537","score":16.750725},{"title":"Selection of distinct populations of dentate granule cells in response to inputs as a mechanism for pattern separation in <span class=\"query-string\">mice</span>","authors":["Wei Deng","Mark Mayford","Fred H Gage"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-03-20","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00312","score":15.737476},{"title":"<span>Usf1</span>, a suppressor of the circadian <span>Clock</span> mutant, reveals the nature of the DNA-binding of the CLOCK:BMAL1 complex in <span class=\"query-string\">mice</span>","authors":["Kazuhiro Shimomura","Vivek Kumar","Nobuya Koike","Tae-Kyung Kim","Jason Chong","Ethan D Buhr","Andrew R Whiteley","Sharon S Low","Chiaki Omura","Deborah Fenner","Joseph R Owens","Marc Richards","Seung-Hee Yoo","Hee-Kyung Hong","Martha H Vitaterna","Joseph Bass","Mathew T Pletcher","Tim Wiltshire","John Hogenesch","Phillip L Lowrey","Joseph S Takahashi"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-04-09","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00426","score":12.482552},{"title":"APP interacts with LRP4 and agrin to coordinate the development of the neuromuscular junction in <span class=\"query-string\">mice</span>","authors":["Hong Y Choi","Yun Liu","Christian Tennert","Yoshie Sugiura","Andromachi Karakatsani","Stephan Kröger","Eric B Johnson","Robert E Hammer","Weichun Lin","Joachim Herz"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-08-20","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00220","score":11.123085},{"title":"The starvation hormone, fibroblast growth factor-21, extends lifespan in <span class=\"query-string\">mice</span>","authors":["Yuan Zhang","Yang Xie","Eric D Berglund","Katie Colbert Coate","Tian Teng He","Takeshi Katafuchi","Guanghua Xiao","Matthew J Potthoff","Wei Wei","Yihong Wan","Ruth T Yu","Ronald M Evans","Steven A Kliewer","David J Mangelsdorf"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2012-10-15","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00065","score":10.312088},{"title":"Rigid firing sequences undermine spatial memory codes in a neurodegenerative mouse model","authors":["Jingheng Cheng","Daoyun Ji"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-06-25","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00647","score":9.697402},{"title":"SEC24A deficiency lowers plasma cholesterol through reduced PCSK9 secretion","authors":["Xiao-Wei Chen","He Wang","Kanika Bajaj","Pengcheng Zhang","Zhuo-Xian Meng","Danjun Ma","Yongsheng Bai","Hui-Hui Liu","Elizabeth Adams","Andrea Baines","Genggeng Yu","Maureen A Sartor","Bin Zhang","Zhengping Yi","Jiandie Lin","Stephen G Young","Randy Schekman","David Ginsburg"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-04-09","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00444","score":6.7231803},{"title":"The activity-dependent histone variant H2BE modulates the life span of olfactory neurons","authors":["Stephen W Santoro","Catherine Dulac"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2012-12-13","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00070","score":6.5898623},{"title":"EBI2-mediated bridging channel positioning supports splenic dendritic cell homeostasis and particulate antigen capture","authors":["Tangsheng Yi","Jason G Cyster"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-05-14","article_type":"","subjects":[],"organisms":[],"id":"10.7554/eLife.00757","score":5.501048}];
var EXAMPLE_PREVIEW_DATA = {"document":{"title":"High-order social interactions in groups of mice","authors":["Yair Shemesh","Yehezkel Sztainberg","Oren Forkosh","Tamar Shlapobersky","Alon Chen","Elad Schneidman"],"intro":"TODO: this should be a short intro which ATM is not extracted.","published_on":"2013-09-03","article_type":"","subjects":[],"organisms":[]},"fragments":[{"id":"heading_7","type":"heading","content":"<h3 data-id=\"heading_7\">Strongly correlated group behavior among <span class=\"query-string\">mice</span></h3>","position":18},{"id":"paragraph_41","type":"paragraph","content":"<p data-id=\"paragraph_41\">We built a hierarchy of maximum entropy models to describe the group configurations, based on successive orders of correlations between the <span class=\"query-string\">mice</span> (one that relies only on individual behavior of the <span class=\"query-string\">mice</span>, one that adds pairwise dependencies between <span class=\"query-string\">mice</span>, third order, etc.). The relationship between these models then allowed us to dissect exactly the contribution of each order to the total group behavior.</p>","position":25},{"id":"paragraph_65","type":"paragraph","content":"<p data-id=\"paragraph_65\">At the age of weaning (4 weeks), <span class=\"query-string\">mice</span> were randomly distributed into 2 types of groups: standard environment (SE) <span class=\"query-string\">mice</span> that were housed in groups of 4 in standard laboratory cages, and complex environment (CE) <span class=\"query-string\">mice</span> that were housed in groups of 16 male <span class=\"query-string\">mice</span> in a relatively spacious and complex cage, with a variety of objects such as shelters, tunnels, running wheels, and mouse nest boxes (<span>Sztainberg and Chen, 2010</span>). After a period of 6 weeks, CE <span class=\"query-string\">mice</span> were randomly divided into groups of four, color marked, and introduced to the novel arena, as the SE <span class=\"query-string\">mice</span>, for analysis of group social behavior.</p>","position":58},{"id":"paragraph_70","type":"paragraph","content":"<p data-id=\"paragraph_70\">The total correlation of all orders between <span class=\"query-string\">mice</span> was quantified by the multi-information of the group (<span>Schneidman et al., 2003</span>)</p>","position":69},{"id":"paragraph_71","type":"paragraph","content":"<p data-id=\"paragraph_71\">where the joint entropy of the <span class=\"query-string\">mice</span> configurations is defined by</p>","position":71},{"id":"paragraph_72","type":"paragraph","content":"<p data-id=\"paragraph_72\">(where {<span>x</span><span><span>i</span></span><span></span>}={<span>x</span><span><span>1</span></span>,<span>x</span><span><span>2</span></span><span></span>,<span>x</span><span><span>3</span></span><span></span>,<span>x</span><span><span>4</span></span><span></span>}) and the entropy of the independent <span class=\"query-string\">mice</span> model or the sum of the entropies of the <span class=\"query-string\">mice</span> is <span>{{inline-formula}}</span>.</p>","position":73},{"id":"heading_21","type":"heading","content":"<h3 data-id=\"heading_21\">Maximum entropy models for <span class=\"query-string\">mice</span> configurations</h3>","position":74},{"id":"paragraph_79","type":"paragraph","content":"<p data-id=\"paragraph_79\">The maximum entropy models of different orders form a hierarchy of correlation-based descriptions of the <span class=\"query-string\">mice</span>, from p<span>(1)</span> where all <span class=\"query-string\">mice</span> are independent, to p<span>(4)</span> which is an a description that allows arbitrary complex interactions; their entropies decrease monotonically toward the true entropy.</p>","position":84},{"id":"paragraph_81","type":"paragraph","content":"<p data-id=\"paragraph_81\">To build a more compact model for the <span class=\"query-string\">mice</span> configurations and isolate the significant functional correlations between the <span class=\"query-string\">mice</span>, we constructed a model, p<span>*</span>, for the <span class=\"query-string\">mice</span> configurations that has the maximal entropy given a set of constraints, but also minimizing the total sum of the non-zero parameters of the model. Thus we added a penalty term (‘regularization’), to the standard maximum entropy optimization problem from <span>equation 6</span>, and maximize</p>","position":88},{"id":"paragraph_84","type":"paragraph","content":"<p data-id=\"paragraph_84\">where <span>π</span> is a permutation of the <span class=\"query-string\">mice</span> labels such that</p>","position":94}]};

console.log('preview data', EXAMPLE_PREVIEW_DATA);

// BrowserController
// =============================

var BrowserController = function(app, config) {
  Controller.call(this, app);
  this.config = config;

  this.searchbarCtrl = new SearchBarController(this);

  this.createView();
};

BrowserController.Prototype = function() {

  this.initialize = function(newState, cb) {
    cb(null);
  };

  this.DEFAULT_STATE = {
    id: "main"
  };

  this.createView = function() {
    if (!this.view) {
      this.view = new BrowserView(this);
    }
    return this.view.render();
  };

  this.transition = function(newState, cb) {
    console.log("BrowserController.transition(%s -> %s)", this.state.id, newState.id);
    // idem-potence
    // if (newState.id === this.state.id) {
    //   var skip = false;
    //   // TODO
    //   skip = true;
    //   if (skip) return cb(null, {skip: true});
    // }

    if (newState.id === "main") {

      // Handle edge case: no searchstr provided
      // TODO: load a set of featured articles
      // if (!newState.searchstr) return cb(null);
      
      if (newState.searchstr !== this.state.searchstr || newState.searchFilters !== this.state.searchFilters) {
        // Search result has changed
        this.loadSearchResult(newState, cb);
      } else if (newState.filters !== this.state.filters) {
        // Filters have been changed
        this.filterDocuments(newState, cb);
      } else if (newState.documentId && newState.documentId !== this.state.documentId) {
        // Selected document has been changed
        console.log('loading preview...');
        this.loadPreview(newState, cb);
      } else {
        console.log('no state change detected, skipping', this.state, newState);
        // cb(null);
        return cb(null, {skip: true});
      }

    } else {
      console.log('state not explicitly handled', this.state, newState);
      return cb(null);
      // cb(null);

    }
  };

  this.encodeFilters = function() {

  };

  // Encode search filters so they can be provided to the search API as a query string
  this.encodeSearchFilters = function(searchFilters) {
    var serializedFilters = {};
    _.each(searchFilters, function(f) {
      if (!serializedFilters[f.facet]) {
        serializedFilters[f.facet] = []
      }
      serializedFilters[f.facet].push(encodeURIComponent(f.value));
    });

    var filterQuery = [];
    _.each(serializedFilters, function(f, key) {      
      filterQuery.push(key+"="+f.join(','));
    });

    return filterQuery.join('&');
  };

  // Get filters from new state
  this.getSearchFilters = function(newState) {
    if (!newState.searchFilters) return {};
    return JSON.parse(newState.searchFilters);
  };

  // Get filters from new state
  this.getFilters = function(newState) {
    if (!newState.filters) return {};
    return JSON.parse(newState.filters);
  };

  // Filter documents according to new filter criteria
  // -----------------------
  // 

  this.filterDocuments = function(newState, cb) {
    var filters = this.getFilters(newState);
    this.searchResult.applyFilters(filters);
    cb(null);
  };

  // Load a new preview
  // -----------------------
  // 

  // this.loadSearchResultAndPreview = function(newState, cb) {
  //   var self = this;
  //   this.loadSearchResult(newState, function() {
  //     self.loadPreview(newState, cb);
  //   });
  // };

  // Load preview
  // -----------------------
  // 

  this.loadPreview = function(newState, cb) {
    // Get filters from app state
    var searchStr = newState.searchstr;
    var documentId = newState.documentId;
    var filters = this.getFilters(newState);
    var self = this;

    // self.previewData = EXAMPLE_PREVIEW_DATA;
    // cb(null);

    $.ajax({
      url: self.config.api_url+"/search/document?documentId="+encodeURIComponent(documentId)+"&searchString="+encodeURIComponent(searchStr),
      dataType: 'json',
      success: function(data) {
        self.previewData = data;
        cb(null);
      },
      error: function(err) {
        console.error(err.responseText);
        cb(err.responseText);
      }
    });
  };

  // Search result gets loaded
  // -----------------------
  // 
  // Filters must be applied too, if there are any
  // Preview must be loaded as well, if documentId is provided
  // TODO: error handling

  this.loadSearchResult = function(newState, cb) {

    console.log('LOADING SEARCH RESULT');
    // Get filters from app state
    var searchStr = newState.searchstr;
    var documentId = newState.documentId;
    var filters = this.getFilters(newState);
    var searchFilters = this.getSearchFilters(newState);
    var self = this;

    console.log('documentId', documentId);

    self.searchResult = new SearchResult({
      query: newState.searchstr,
      documents: EXAMPLE_SEARCHRESULT
    }, filters);

    // if (documentId) {
    //   self.loadPreview(newState, cb);
    // } else {
    //   self.previewData = null;
    //   cb(null);
    // }
    // return;

    var encodedSearchFilters = this.encodeSearchFilters(searchFilters);

    console.log('encodedSearchFilters', encodedSearchFilters);

    $.ajax({
      url: this.config.api_url+"/search?searchString="+encodeURIComponent(searchStr)+"&"+encodedSearchFilters,
      dataType: 'json',
      success: function(data) {
        // TODO: this structure should be provided on the server
        self.searchResult = new SearchResult({
          query: newState.searchstr,
          documents: data
        }, filters);

        if (documentId) {
          self.loadPreview(newState, cb);
        } else {
          self.previewData = null;
          cb(null);
        }
      },
      error: function(err) {
        console.error(err.responseText);
        cb(err.responseText);
      }
    });

    // this.searchResult = new SearchResult(exampleSearchResult, filters);    
  };

  this.afterTransition = function(oldState) {
    var newState = this.state;
    this.view.afterTransition(oldState, newState);
  };
};

BrowserController.Prototype.prototype = Controller.prototype;
BrowserController.prototype = new BrowserController.Prototype();

BrowserController.Controller = BrowserController;

module.exports = BrowserController;