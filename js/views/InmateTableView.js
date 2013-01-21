define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
    'spin',
    'bootstrap',

    // Our apps
    'collections/InmateCollection',

    // Templates
    'text!templates/inmate_table.html'
], function($, _, Backbone, Spinner, Bootstrap, InmateCollection, inmate_table) {

    var InmateTableView = Backbone.View.extend({
        collection: InmateCollection,
        el: '#content',
        events: {
            'click th .btn': 'sort',
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
            var compiled_template = _.template(inmate_table, { inmates: this.collection.toJSON() });
            this.$el.html(compiled_template);
            this.spinner.stop();
            return this;
        },
        sort: function(evt) {
            var btn = $(evt.currentTarget),
            isAscending = btn.hasClass('asce'),
            sortByColumn = btn.parents('th:first'),
            attribute = sortByColumn.attr('id');
            console.log('sort ' + (isAscending ? 'ascending': 'decending') + ' by ' + attribute);

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
