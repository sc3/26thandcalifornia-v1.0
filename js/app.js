var InmateModel = Backbone.Model.extend();

var InmateCollection = Backbone.Collection.extend({
    url: INMATE_URL,
    model: InmateModel,
    sync: function(method, model, options) {
        var params = _.extend({
            type: 'GET',
            dataType: 'jsonp',
            url: this.url,
        }, options);
        return $.ajax(params);
    },
    parse: function(data) {
        this.meta = data.meta;
        _.each(data.objects, function(inmate, i) {
            var start = new moment(inmate.booking_date);
            var end = (inmate.discharge_date_earliest) ? new moment(inmate.discharge_date_earliest) : new moment();
            inmate.stay_length = end.diff(start, 'days');
        });
        return data.objects;
    }
});

// Summary view
var InmateTableView = Backbone.View.extend({
    collection: InmateCollection,
    el: '#inmates',
    template: '#inmates-template',
    initialize: function(options) {
        this.template = (options.template) ? _.template(options.template) : _.template($(this.template).html());
        this.collection.bind('reset', this.render, this);
    },
    render: function(options) {
        var context = { inmates: this.collection.toJSON() };
        this.$el.html(this.template(context));
        return this;
    }
});

