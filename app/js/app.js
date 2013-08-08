define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
    'spin',

    // Application
    'models/InmateModel',
    'collections/InmateCollection',
    'collections/DailyPopulationCollection',
    'views/MenuView',
    'views/PageView',
    'views/HistogramView',
    'views/GenStatsView',
    'views/IncarcerationStatsView',
    'views/BailStatsByRaceView',
    'views/AgeAtBookingStatsView',
    'views/JailPopulationStatsView',
    'views/BookingsPerDayStatsView',

    // Templates
    'text!templates/about.jst'

], function($, _, Backbone, Spinner, InmateModel, InmateCollection, DailyPopulationCollection, MenuView, PageView, HistogramView,
            GenStatsView, IncarcerationStatsView, BailStatsByRaceView, AgeAtBookingStatsView, JailPopulationStatsView,
            BookingsPerDayStatsView, about) {

    // Application routes
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'about',
            'histogram': 'histogram',
            'gen_stats': 'gen_stats',
            'incarceration_stats': 'incarceration_stats',
            'bail_stats_by_race': 'bail_stats_by_race',
            'age_at_booking_stats': 'age_at_booking_stats',
            'jail_population_stats': 'jail_population_stats',
            'bookings_per_day_stats': 'bookings_per_day_stats',
            'about': 'about'
        }
    });

    // Initialize
    var initialize = function() {
        var router = new AppRouter();

        // Initialize collection
        var inmate_collection = new InmateCollection([]);
        var population_collection = new DailyPopulationCollection([]);

        // Spinner
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
          zIndex: 2e9, // The z-index (defaults to 2000000000)t
        };

        $('#content').css('min-height', $(window).height() + 'px');

        var spinner_el = $('#spinner');
        var spinner = new Spinner(spinner_opts).spin(spinner_el.get(0));

        inmate_collection.on('fetch:start', function() {
            spinner_el.fadeIn();
        }, this);

        inmate_collection.on('reset', function() {
            spinner_el.fadeOut();
        }, this);

        population_collection.on('fetch:start', function() {
            spinner_el.fadeIn();
        }, this);

        population_collection.on('reset', function() {
            spinner_el.fadeOut();
        }, this);

        // Render histogram page template on 'histogram' navigation event
        var histogram = new HistogramView({collection: inmate_collection});
        router.on('route:histogram', function() {
          inmate_collection.fetch({
            success: _.bind(histogram.render_advanced, histogram)
          });
        });


        // Render gen stats page template on 'gen_stats' navigation event
        var gen_stats = new GenStatsView({collection: inmate_collection});
        router.on('route:gen_stats', function() {
          inmate_collection.fetch({
            success: _.bind(gen_stats.renderInit, gen_stats)
          });
        });

        // Render incarceration stats page template on 'incarceration' navigation event
        var incarceration_stats = new IncarcerationStatsView({collection: inmate_collection});
        router.on('route:incarceration_stats', function() {
          inmate_collection.fetch({
            success: _.bind(incarceration_stats.renderInit, incarceration_stats)
          });
        });

        // Render bail stats by race page template on 'incarceration' navigation event
        var bail_stats_by_race = new BailStatsByRaceView({collection: inmate_collection});
        router.on('route:bail_stats_by_race', function() {
          inmate_collection.fetch({
            success: _.bind(bail_stats_by_race.renderInit, bail_stats_by_race)
          });
        });

        // Render age at booking stats page template on 'incarceration' navigation event
        var age_at_booking_stats = new AgeAtBookingStatsView({collection: inmate_collection});
        router.on('route:age_at_booking_stats', function() {
          inmate_collection.fetch({
            success: _.bind(age_at_booking_stats.renderInit, age_at_booking_stats)
          });
        });

        // Render age at booking stats page template on 'incarceration' navigation event
        var jail_population_stats = new JailPopulationStatsView({collection: inmate_collection});
        router.on('route:jail_population_stats', function() {
          inmate_collection.fetch({
            success: _.bind(jail_population_stats.renderInit, jail_population_stats)
          });
        });

        // Render bookings per data stats page template on 'bookings_per_day' navigation event
        var route_stats_view = function(view_constructor_fn, route_name) {
            var view = new view_constructor_fn({collection: inmate_collection});
            router.on('route:' + route_name, function() {
              inmate_collection.fetch({
                success: _.bind(view.renderInit, view)
              });
            });
            return view;
        };

        var stat_pages = [];
        stat_pages.push(route_stats_view(BookingsPerDayStatsView, 'bookings_per_day_stats'));

        // Render about page template on 'about' navigation event
        var about_page = new PageView({template: about});
        router.on('route:about', function() {
            about_page.render();
            population_collection.fetch({
                data: { 'order_by' : '-date', limit: 1 },
                success: function() {
                    var total = population_collection.toJSON().pop().total;
                    $('#content h1').after($("<h3>Yesterday, " + total + " inmates were scraped from the inmate locator.</h3><hr />"));
                }
            });
        });

        // Menu requires history fragment to set default active tab, so it loads
        // after history starts.
        Backbone.history.start();
        var menu = new MenuView();
    };

    // Return our module interface
    return {
        initialize: initialize
    };

});




