define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap',

// Our apps
'collections/InmateCollection',

// Templates
'text!templates/inmate_table.html', 'text!templates/inmate_table_body.html'], function($, _, Backbone, Spinner, Bootstrap, InmateCollection, inmate_table, inmate_table_body) {

    var InmateTableView = Backbone.View.extend({
        collection: InmateCollection,
        el: '#content',
        paginateMarker: 0,
        amountToDisplay: 20,
        events: {
            'click th .btn': 'sort',
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
          //you need bound check for last record here...
          //((this.paginateMarker += this.amountToDisplay) <= this.collection.last)
          if(true){
              first = this.paginateMarker;
              this.paginateMarker += this.amountToDisplay;
              this.render({
                data: this.collection.toJSON(),
                firstMarker: first, lastMarker: this.paginateMarker
              });
          }
        },

        goBackward: function(){
          var first, last;
          if( (this.paginateMarker >= this.amountToDisplay)){
              this.paginateMarker -= this.amountToDisplay;
              last = this.paginateMarker;
              first = this.paginateMarker - this.amountToDisplay;
              this.render({data: this.collection.toJSON(), firstMarker: first,lastMarker: last });
          }

        },
        initialize: function(options) {
            // Call 'spin' when collection AJAX request starts.
            //this.collection.bind('fetch', this.spin, this);

            // Call 'render' when collection AJAX request is done.
            // this.collection.bind('reset', this.render, this);

            // Call 'renderlist' when collection sort is performed.
            this.collection.bind('sort', this.renderlist, this);
        },
        spin: function() {
            // Clear element and start spinner on collection start
            this.$el.html('');
            this.spinner = new Spinner().spin(this.el);
            return this;
        },
        incrementPaginateMaker: function(){
          this.paginateMarker += this.amountToDisplay;
        },
        initRender: function(options){
          //i need sorted data here first, and i think i can just increment form here and don't need to slice here since renderlist will
          var dataSet = this.collection.toJSON();
          this.renderlist({collection: dataSet, callback: this.incrementPaginateMaker});
                
        },
        render: function(options) {
            // Render template and stop spinner.
            //my render expects a dataset and markers returned from array slicing. 

            //my renderlist expected to be called from the user asking for either default first set of data or specific set of data.

            //his renderlist expects nothing of the sort ha!
            // it expects to just render everything. i may want to rename
            //his function sortlist and have it call my render (using his DOM modifications) with first set to 0 and set this.paginate to 20 because that will call get range and then display that set of the sorted entire collection. 

            //so whatever sorts - calls renderlist, which means i'd need it to look at the markers and pass those to
            var collection = {
                inmates: this.collection.toJSON()
            },
            compiled_template = _.template(inmate_table, collection);
            this.$el.html(compiled_template);
            this.renderlist({collection : collection});
            //this.spinner.stop();
            return this;
        },
        renderlist: function(options) {
            var collection = options && options.collection ? options.collection : {
                inmates: this.collection.toJSON()
            };
            //and since sort always calls renderList,this is the way to go.


            //instead of passing whole collection, could pass ranged. however what were are really doing is needing to keep track of where we are, so for instance if we just do this we haven't incremented. we are really emulating the init form of paginate here, which perhaps should be  method, and what it does is collect a range and then set the paginateMarker.

            var rangeOfCollection = this.getRangeOfJSONData({data: collection, first: first, last: this.amountToDisplay });

            var compiled_template = _.template(inmate_table_body, rangeOfCollection);
            this.$el.find('.inmate-list').html(compiled_template);

            if (options && options.callback) {
              callback();
            }

            return this;
        },
        sort: function(evt) {
            var btn = $(evt.currentTarget),
                isAscending = btn.hasClass('asce'),
                sortByColumn = btn.parents('th:first'),
                attribute = sortByColumn.attr('id');
            console.log('sort ' + (isAscending ? 'ascending' : 'decending') + ' by ' + attribute);

            // Add sortedby to selected Column
            sortByColumn.addClass('sortedby');

            // Reset Filter buttons & sortedby class from inactive columns
            var otherColumns = $('th').siblings().not(sortByColumn);
            otherColumns.find('.btn + .active').removeClass('active');
            otherColumns.removeClass('sortedby');

            this.collection.sortByAttribute(attribute, isAscending);
        }
    });

    return InmateTableView;

});
