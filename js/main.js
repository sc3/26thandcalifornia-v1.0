// Configure RequireJS

// Inmate URL configuration variable
var INMATE_URL = 'http://vast-retreat-3472.herokuapp.com/api/1.0/countyinmate/?format=jsonp';

// RequireJS aliases
require.config({
    paths: {
        jquery: '../lib/jquery-1.8.3.min',
        underscore: '../lib/underscore-1.4.2.min',
        backbone: '../lib/backbone-0.9.2.min',
        text: '../lib/text',
        moment: '../lib/moment',
        templates: '../templates'
    }

});

// Bootstrap our application.
require([
    'app',
], function(App){
    App.initialize();
});
