// Configure RequireJS

// Inmate URL configuration variable
var INMATE_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/countyinmate/';
var POPULATION_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/dailypopulationcounts/';

// Libraries
require.config({
    paths: {
      jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
      underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min',
      backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
      backbone_querystring: 'lib/query-string',
      d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.2.2/d3.v3.min',
      text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.5/text',
      spin: '//cdnjs.cloudflare.com/ajax/libs/spin.js/1.2.7/spin.min',
      moment: '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.1.0/moment.min',
      highcharts: '//cdnjs.cloudflare.com/ajax/libs/highcharts/3.0.2/highcharts'
    },
    shim: {
      backbone: {
        deps: ['jquery', 'underscore'],
        exports: 'Backbone'
      },
      underscore: {
        exports: '_'
      },
      spin: {
          exports: 'Spinner'
      },
      d3: {
        exports: 'd3'
      },
      highcharts: {
        deps: [ "jquery" ],
        exports: "Highcharts"
      }
    }
});

// Set up app
require([
  'backbone',
  'moment',
  'views/SpinView',
  'views/MenuView',
  'backbone_querystring'
],
function(Backbone, moment, SpinnerView, MenuView){
  var JailRouter = Backbone.QueryRouter.extend({
    routes: {
      '' : 'render',
      ':view/': 'render'
    },
    loadedViews: {},
    render: function() {
      var loaded = this.loadedViews,
          args = Array.prototype.slice.call(arguments),
          params = args.pop(),
          view = (args.length === 1) ? args.pop() : 'home';

      // Set default params
      if (_.isEmpty(params)) {
        var now = moment();
        var last = moment([now.year(), now.month(), 1]);
        var first = moment(last).subtract('month', 1);
        params = {
          'date__gte': first.format('YYYY-MM-DD'),
          'date__lt': last.format('YYYY-MM-DD'),
          'limit': 0,
        };
        return this.navigate(view + '/?' + $.param(params), { trigger: true, replace: true });
      }

      // Construct a view name like 'HomeView'
      view = view + 'View';

      // Hide content, then...
      $('#content').fadeOut(function() {
        // Empty
        $('#content').empty();

        // Load if necessary and render
        if (!loaded[view]) {
          require(['views/'+view], function(View) {
            loaded[view] = new View({ el: $('#content') });
            loaded[view].deferred_render(params).done(function() {
              $('#content').fadeIn();
            });
          });
        } else {
          loaded[view].deferred_render(params).done(function() {
            $('#content').fadeIn();
          });
        }
      });
    }
  });

  // Responsive height setting
  var setHeight = function() {
                    $('#content, #jail-content').css('min-height', $(window).height() + 'px');
                  };
  setHeight();
  $(window).on('resize', setHeight);

  // Spinner
  var spinner = new SpinnerView({ el: $('#spinner') });
  var router = new JailRouter();
  var menu = new MenuView({ el: $('#menu'), router: router });
  Backbone.history.start();

});
