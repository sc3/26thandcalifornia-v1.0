// Configure RequireJS

// Inmate URL configuration variable
var INMATE_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/countyinmate/';
var POPULATION_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/dailypopulationcounts/';

// RequireJS aliases
require.config({
    paths: {
        jquery: '../lib/jquery-1.8.3.min',
        underscore: '../lib/underscore-1.4.2.min',
        backbone: '../lib/backbone-0.9.2.min',
        backbone_mutators: '../lib/backbone.mutators.min',
        text: '../lib/text',
        moment: '../lib/moment',
        templates: '../templates',
        spin: '../lib/spin.min',
        bootstrap: '../lib/bootstrap-2.2.2/js/bootstrap.min',
        d3: '../lib/d3.v3.min'
    },
    shim: {
        spin: {
            exports: 'Spinner'
        },
        backbone_mutators: 'backbone',
        bootstrap: 'jquery',
        d3: {
            exports: 'd3'
        }
    }
});

// Load our application by requiring it, then calling it's
// initialize method.
require([
    'app'
], function(App){
    App.initialize();
});
