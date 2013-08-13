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
      spin: '//cdnjs.cloudflare.com/ajax/libs/spin.js/1.2.7/spin.min'
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
  'spin',
  'views/MenuView',
  'backbone_querystring',
],
function(Backbone, Spinner, MenuView){
  var JailRouter = Backbone.QueryRouter.extend({
    routes: {
      '' : 'render',
      ':view/': 'render',
    },
    loadedViews: {},
    render: function() {
      //console.log(params);
      var args = Array.prototype.slice.call(arguments);
      var params = args.pop();
      var view = (args.length === 1) ? args.pop() : 'home';

      // Construct a view name like 'HomeView'
      view = view.toLowerCase().replace(/\b[a-z]/g, function(letter) {
          return letter.toUpperCase();
      }) + 'View';
      var loaded = this.loadedViews;

      // Load
      $('#content').empty().hide();
      if (!loaded[view]) {
        require(['views/'+view], function(View) {
          loaded[view] = new View({ el: $('#content') });
          loaded[view].render(params).$el.fadeIn();
        })
      } else {
        loaded[view].render(params).$el.fadeIn();
      }

      //console.log('route ' + view + ' triggered');

    }
  });
  // Menu view
  // Spinner view
  var spinner_opts = {
    lines: 12, // The number of lines to draw
    length: 12, // The length of each line
    width: 6, // The line thickness
    radius: 14, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb
    speed: 1.2, // Rounds per second
    trail: 40, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 0, // The z-index (defaults to 2000000000)t
  };

  $('#content').css('min-height', $(window).height() + 'px');

  var spinner_el = $('#spinner');
  var spinner = new Spinner(spinner_opts).spin(spinner_el.get(0));

  var menu = new MenuView({ el: $('#menu') });

  var router = new JailRouter();
  Backbone.history.start();
});
