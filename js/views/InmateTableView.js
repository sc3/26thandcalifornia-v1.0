define([
    'jquery',
    'underscore',
    'backbone',
    'collections/InmateCollection',
    'text!templates/inmate_table.html'
], function($, _, Backbone, InmateCollection, inmate_table) {
    var InmateTableView = Backbone.View.extend({
        collection: InmateCollection,
        el: '#content',
        initialize: function(options) {
            this.collection.bind('fetch', this.spin, this);
            this.collection.bind('reset', this.render, this);
        },
        spin: function() {
            this.$el.html('');
            this.spinner = new Spinner().spin(this.el);
            return this;
        },
        render: function(options) {
            var context = { inmates: this.collection.toJSON() };
            var compiled_template = _.template(inmate_table, context);
            this.$el.html(compiled_template);
            this.spinner.stop();
            return this;
        }
    });

    return InmateTableView;

});
