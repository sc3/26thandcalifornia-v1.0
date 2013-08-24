define(['underscore', 'backbone'], function(_, Backbone) {

    var MinMaxAverageModel = Backbone.Model.extend({
        defaults: {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            average: 0,
            sum: 0,
            count: 0
        },
        add: function(value) {
            if (value < this.get('min')) {
                this.set('min', value);
            }
            if (value > this.get('max')) {
                this.set('max', value);
            }
            var sum = this.get('sum') + value;
            this.set('sum', sum);
            var count = this.get('count') + 1;
            this.set('count', count);
            this.set('average', sum / count);
            return this;
        },
        average: function() {
            return this.get('average');
        },
        max: function() {
            return this.get('max');
        },
        min: function() {
            return this.get('min');
        }
    });

    return MinMaxAverageModel;

});
