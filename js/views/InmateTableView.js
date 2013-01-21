define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
    'spin',

    // Our apps
    'collections/InmateCollection',

    // Templates
    'text!templates/inmate_table.html'
], function($, _, Backbone, Spinner, InmateCollection, inmate_table) {

    var InmateTableView = Backbone.View.extend({
        collection: InmateCollection,
        el: '#content',
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
        }
    });

    return InmateTableView;

});
