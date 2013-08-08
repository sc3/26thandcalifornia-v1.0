define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',

    // Application
    'models/InmateModel',
    'collections/InmateCollection',
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

], function($, _, Backbone, InmateModel, InmateCollection, MenuView, PageView, HistogramView,
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

        // stats_data_options - options used to fetch data for the following stats views
        var stats_data_options = { 'limit': 0 };


        inmate_collection.bind('fetch:start', function() {
            console.log('start');
        }, this);

        inmate_collection.bind('reset', function() {
            console.log('end');
        }, this);

        // Render histogram page template on 'histogram' navigation event
        var histogram = new HistogramView({collection: inmate_collection});
        router.on('route:histogram', function() {
          inmate_collection.fetch({
            data: stats_data_options,
            success: _.bind(histogram.render_advanced, histogram)
          });
        });


        // Render gen stats page template on 'gen_stats' navigation event
        var gen_stats = new GenStatsView({collection: inmate_collection});
        router.on('route:gen_stats', function() {
          inmate_collection.fetch({
            data: stats_data_options,
            success: _.bind(gen_stats.renderInit, gen_stats)
          });
        });

        // Render incarceration stats page template on 'incarceration' navigation event
        var incarceration_stats = new IncarcerationStatsView({collection: inmate_collection});
        router.on('route:incarceration_stats', function() {
          inmate_collection.fetch({
            data: stats_data_options,
            success: _.bind(incarceration_stats.renderInit, incarceration_stats)
          });
        });

        // Render bail stats by race page template on 'incarceration' navigation event
        var bail_stats_by_race = new BailStatsByRaceView({collection: inmate_collection});
        router.on('route:bail_stats_by_race', function() {
          inmate_collection.fetch({
            data: stats_data_options,
            success: _.bind(bail_stats_by_race.renderInit, bail_stats_by_race)
          });
        });

        // Render age at booking stats page template on 'incarceration' navigation event
        var age_at_booking_stats = new AgeAtBookingStatsView({collection: inmate_collection});
        router.on('route:age_at_booking_stats', function() {
          inmate_collection.fetch({
            data: stats_data_options,
            success: _.bind(age_at_booking_stats.renderInit, age_at_booking_stats)
          });
        });

        // Render age at booking stats page template on 'incarceration' navigation event
        var jail_population_stats = new JailPopulationStatsView({collection: inmate_collection});
        router.on('route:jail_population_stats', function() {
          inmate_collection.fetch({
            data: stats_data_options,
            success: _.bind(jail_population_stats.renderInit, jail_population_stats)
          });
        });

        // Render bookings per data stats page template on 'bookings_per_day' navigation event
        var route_stats_view = function(view_constructor_fn, route_name) {
            var view = new view_constructor_fn({collection: inmate_collection});
            router.on('route:' + route_name, function() {
              inmate_collection.fetch({
                data: stats_data_options,
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




