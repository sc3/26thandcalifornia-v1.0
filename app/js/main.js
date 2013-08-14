// Configure RequireJS

// Inmate URL configuration variable
var INMATE_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/countyinmate/';
var POPULATION_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/dailypopulationcounts/';

// RequireJS aliases
require.config({
    paths: {
      jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
      underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min',
      backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
      backbone_fetch_cache: '//cdnjs.cloudflare.com/ajax/libs/backbone.fetch-cache/1.0.0/backbone.fetch-cache.min',
      backbone_querystring: 'lib/query-string',
      d3: '//cdnjs.cloudflare.com/ajax/libs/d3/3.2.2/d3.v3.min',
      text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.5/text',
      spin: '//cdnjs.cloudflare.com/ajax/libs/spin.js/1.2.7/spin.min',
      moment: '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.1.0/moment.min',
    },
    shim: {
      backbone: {
        deps: ['jquery', 'underscore'],
        exports: 'Backbone'
      },
      underscore: {
        exports: '_',
      },
      spin: {
          exports: 'Spinner'
      },
      d3: {
        exports: 'd3'
      }
    }
    //paths: {
        //jquery: '../lib/jquery-1.8.3.min',
        //underscore: '../lib/underscore-1.4.2.min',
        //backbone: '../lib/backbone-0.9.2.min',
        //backbone_mutators: '../lib/backbone.mutators.min',
        //text: '../lib/text',
        //moment: '../lib/moment',
        //templates: '../templates',
        //spin: '../lib/spin.min',
        //bootstrap: '../lib/bootstrap-2.2.2/js/bootstrap.min',
        //d3: '../lib/d3.v3.min'
    //},
    //shim: {
        //spin: {
            //exports: 'Spinner'
        //},
        //backbone_mutators: 'backbone',
        //bootstrap: 'jquery',
        //d3: {
            //exports: 'd3'
        //}
    //}
});

require([
  'backbone',
  'views/SpinView',
  'views/MenuView',
  'backbone_querystring',
],
function(Backbone, SpinnerView, MenuView){
  var JailRouter = Backbone.QueryRouter.extend({
    routes: {
      '' : 'render',
      ':view/': 'render',
    },
    loadedViews: {},
    render: function() {
      var loaded = this.loadedViews,
          args = Array.prototype.slice.call(arguments),
          params = args.pop(),
          view = (args.length === 1) ? args.pop() : 'home';

      // Construct a view name like 'HomeView'
      view = view.toLowerCase().replace(/\b[a-z]/g, function(letter) {
          return letter.toUpperCase();
      }) + 'View';

      // Hide content, then...
      $('#content').fadeOut(function() {
        // Empty
        $('#content').empty();

        // Load if necessary and render
        if (!loaded[view]) {
          require(['views/'+view], function(View) {
            loaded[view] = new View({ el: $('#content') });
            loaded[view].render(params).done(function() {
              $('#content').fadeIn();
            });
          })
        } else {
          loaded[view].render(params).done(function() {
            $('#content').fadeIn();
          });
        }
      });
    }
  });

  // Responsive height setting
  var setHeight = function() {
    $('#content, #jail-content').css('min-height', $(window).height() + 'px');
  }
  setHeight();
  $(window).on('resize', setHeight);

  // Spinner
  var spinner = new SpinnerView({ el: $('#spinner') });
  var router = new JailRouter();
  var menu = new MenuView({ el: $('#menu'), router: router });
  Backbone.history.start();

});
