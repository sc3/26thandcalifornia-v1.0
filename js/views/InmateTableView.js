define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap',

// Our apps
'collections/InmateCollection',

// Templates
'text!templates/inmate_table.jst',
'text!templates/inmate_table_body.jst'],

function($, _, Backbone, Spinner, Bootstrap, InmateCollection, inmate_table, inmate_table_body) {

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
          // If condition need to be tested with numbers that this.collection isn't divisible by
          if((this.paginateMarker + this.amountToDisplay) <= this.collection.length){
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
            this.collection.bind('sort', this.renderSorted, this);
        },
        spin: function() {
            // Clear element and start spinner on collection start
            this.$el.html('');
            this.spinner = new Spinner().spin(this.el);
            return this;
        },
        resetPaginateMaker: function(){
          //a way of saying set this back to first set (it's last record of first set)
          this.paginateMarker = this.amountToDisplay;
        },

        renderInit: function(argument) {
          var dataSet = this.collection.toJSON();
          var compiled_table_template = _.template(inmate_table, { inmates: dataSet });

          //what are key differences between these three similar methods?

          this.$el.html(compiled_table_template);

          //calls renderSorted then calls resetPaginate
          this.renderSorted({collection : {inmates: dataSet}});
          this.resetPaginateMaker();
        },

        render: function(options) {
          var dataSet = this.collection.toJSON();
           
          //checks options for range markers
          if (options && options.firstMarker && options.lastMarker){
            dataSet = this.getRangeOfJSONData( this.collection.toJSON(),options.firstMarker, options.lastMarker );
          }

          //only redoes table body

          var compiled_template = _.template(inmate_table_body, {inmates:dataSet});
          this.$el.find('.inmate-list').html(compiled_template);
            //this.spinner.stop();
            return this;
        },
        renderSorted: function(options) {

          var collection = options && options.collection ? options.collection : {
              inmates: this.collection.toJSON()
          };


          var range = collection.inmates ? collection.inmates : collection;

          var rangeOfCollection = this.getRangeOfJSONData(range, 0, this.amountToDisplay);
          var compiled_template = _.template(inmate_table_body, {inmates:rangeOfCollection});
          this.$el.find('.inmate-list').html(compiled_template);
          this.resetPaginateMaker();


          return this;
        },
        sort: function(evt) {
            var btn = $(evt.currentTarget),
                isAscending = btn.hasClass('asce'),
                sortByColumn = btn.parents('th:first'),
                attribute = sortByColumn.attr('id');
            //console.log('sort ' + (isAscending ? 'ascending' : 'decending') + ' by ' + attribute);

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
