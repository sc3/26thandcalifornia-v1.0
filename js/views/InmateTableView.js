"use strict";
define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',

    // Our apps
    'collections/InmateCollection',

    // Templates
    'text!templates/inmate_table.html'
], function($, _, Backbone, InmateCollection, inmate_table) {

    var InmateTableView = Backbone.View.extend({
        collection: InmateCollection,
        el: '#content',
        paginateMarker: 0,
        amountToDisplay: 20,
        events: {
            'click #next': 'goForward',
            'click #back': 'goBackward'
        },
        getRangeOfJSONData: function(data, first, last){
          var dataSet;
          if (typeof data !== Array) {
              dataSet = _.toArray(data).slice(first,last);
          } else {
              dataSet = data.slice(first,last);
          }
          return dataSet;
        },
        goForward: function(){
          var first;
      
          first = this.paginateMarker;
          this.paginateMarker += this.amountToDisplay;
          this.render({data: this.collection.toJSON(), firstMarker: first, lastMarker: this.paginateMarker});
        },
        
        goBackward: function(){
          console.log('hi backwards!!!');
          //this.offset -= 20;
          this.paginateMarker -= 20;
          console.log(this.paginateMarker);
        },
        initialize: function(options) {
            // Call 'spin' when collection AJAX request starts.
            this.collection.bind('fetch', this.spin, this);

            // Call 'render' when collection AJAX request is done.
            this.collection.bind('reset', this.render, this);
        },
        spin: function() {
            // Clear element and start spinner on collection start
            this.$el.html('');
            this.spinner = new Spinner().spin(this.el);
            return this;
        },
        render: function(options) {
          // Render template and stop spinner.
          //also should only get 20 rows at first.
          var dataSet = this.collection.toJSON();

          if (this.paginateMarker === 0) {
            options.firstMarker = 0;
            options.lastMarker = 20;
          }
          
          dataSet = this.getRangeOfJSONData( this.collection.toJSON(),options.firstMarker, options.lastMarker );
          
          var compiled_template = _.template(inmate_table, { inmates: dataSet });
          this.$el.html(compiled_template);
          this.spinner.stop();
          return this;
        }
    });

    return InmateTableView;

});
