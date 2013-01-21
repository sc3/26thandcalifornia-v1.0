// Configure RequireJS

// Inmate URL configuration variable
var INMATE_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/countyinmate/'; 

// RequireJS aliases
require.config({
    paths: {
        jquery: '../lib/jquery-1.8.3.min',
        underscore: '../lib/underscore-1.4.2.min',
        backbone: '../lib/backbone-0.9.2.min',
        text: '../lib/text',
        moment: '../lib/moment',
        templates: '../templates',
        spin: '../lib/spin.min'
    },
    shim: {
        spin: {
            exports: 'Spinner'
        }
    }
});

// Load our application by requiring it, then calling it's
// initialize method.
require([
    'app',
], function(App){
    App.initialize();
});
