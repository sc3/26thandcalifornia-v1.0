define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',

    // Application
    'models/InmateModel',
    'collections/InmateCollection',
    'views/InmateTableView',
    'views/MenuView',
    'views/PageView',
    'views/HistogramView',
    'views/GenStatsView',
    'views/IncarcerationStatsView',
    'views/BailStatsByRaceView',
    'views/AgeAtBookingStatsView',
    'views/JailPopulationStatsView',

    // Templates
    'text!templates/about.jst'

], function($, _, Backbone, InmateModel, InmateCollection, InmateTableView, MenuView, PageView, HistogramView,
            GenStatsView, IncarcerationStatsView, BailStatsByRaceView, AgeAtBookingStatsView, JailPopulationStatsView,
            about) {

    // Application routes
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'inmates',
            'inmates': 'inmates',
            'histogram': 'histogram',
            'gen_stats': 'gen_stats',
            'incarceration_stats': 'incarceration_stats',
            'bail_stats_by_race': 'bail_stats_by_race',
            'age_at_booking_stats': 'age_at_booking_stats',
            'jail_population_stats': 'jail_population_stats',
            'about': 'about'
        }
    });

    // Initialize
    var initialize = function() {
        var router = new AppRouter();

        // Initialize collection
        var inmate_collection = new InmateCollection();

        // Render inmate table view on 'inmates' navigation event
        var inmates = new InmateTableView({collection: inmate_collection});
        router.on('route:inmates', function() {
          inmate_collection.fetch({
           // data: { 'limit': 0 },
           success: _.bind(inmates.renderInit, inmates)
          });
        });

        // Render histogram page template on 'histogram' navigation event
        var histogram = new HistogramView({collection: inmate_collection});
        router.on('route:histogram', function() {
          inmate_collection.fetch({
            data: { 'discharge_date_earliest__isnull': 'False', 'booking_date__gte': '2013-01-01', 'booking_date__lte': '2013-01-14', 'limit': 0 },
            success: _.bind(histogram.render_advanced, histogram)
          });
        });

        // stats_data_options - options used to fetch data for the following stats views 
        var stats_data_options = { 'limit': 0 };
        // var stats_data_options = { 'booking_date__gte': '2012-12-31', 'limit': 0 };
        // var stats_data_options = { 'booking_date__gte': '2013-01-01', 'limit': 0 };
        // var stats_data_options = { 'booking_date__gte': '2013-01-01', 'booking_date__lte': '2013-01-07', 'limit': 0 };
        // var stats_data_options = { 'booking_date__gte': '2013-01-01', 'booking_date__lte': '2013-01-15', 'limit': 0 };
        // var stats_data_options = { 'booking_date__gte': '2013-01-01', 'booking_date__lte': '2013-01-22', 'limit': 0 };
        // var stats_data_options = { 'booking_date__gte': '2013-03-04', 'booking_date__lte': '2013-03-10', 'limit': 0 };
        // var stats_data_options = { 'discharge_date_earliest__gt': '2013-03-01', 'limit': 0 };
        // var stats_data_options = { 'booking_date__gte': '2012-12-31', 'booking_date__lte': '2013-01-07', 'limit': 0 };
        // var stats_data_options = { 'booking_date': '2013-02-15', 'limit': 0 };
        // var stats_data_options = { 'discharge_date_earliest__isnull': 1, 'booking_date__gte': '1990-01-01', 'limit': 0 };

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




