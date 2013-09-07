/*
 * Define a home screen view
 *
 * This is currently the best documented view and should be used for reference.
 *
 * All views must extend JailView to work with the top level app.
 */

define([
  'backbone',
  'views/JailView',
  'collections/DailyPopulationCollection',
  'text!templates/home.jst',
  'highcharts'
],
function(Backbone, JailView, DailyPopulationCollection, template, Highcharts) {
  var HomeView = JailView.extend({

    // Set your collection and initial state with initialize
    initialize: function() {
      // All views assume there will be a collection.
      this.collection = new DailyPopulationCollection();

      // Most views should render a template
      this.template = _.template(template);
    },

    // Render will be called automatically when route is trigger and
    // collection is fetched.
    render: function() {
      // Render the template
      var rendered = this.template({
        dailypopulation: this.collection.toJSON()
      });
      this.$el.html(rendered);

      // Attach a chart
      $('.population-chart').highcharts({
        title: {
          text: 'Inmates per day'
        },
        xAxis: { type: 'datetime' },
        yAxis: { title: 'Inmates recorded by scraper' },
        legend: { enabled: false },
        credits: { enabled: false },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
              ]
            },
            lineWidth: 1,
            marker: {
              enabled: false
            },
            shadow: false,
            states: {
              hover: {
                lineWidth: 1
              }
            },
            threshold: null
          }
        },
        series: [{
          type: 'area',
          name: 'Total inmates',
          pointInterval: 24 * 3600 * 1000,
          pointStart: this.get_start_date(),
          data: this.collection.pluck('total')
        }]
      });
    },
    get_start_date: function() {
        var options = this.collection.cached_data_options;
        if (options['booking_date__gte']) {
            var dateArray = options['booking_date__gte'].split("-");
            return Date.UTC(parseInt(dateArray[0]), parseInt(dateArray[1])-1 , parseInt(dateArray[2]));
        }
        return Date.UTC(2013, 0, 1);
    }
  });
  return HomeView;
});
