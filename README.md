# 26th and California

A Backbone-based app to browse and visualize data from the Supreme
Chi-Town Coding Crew's [Cook County Jail API](http://cookcountyjail.recoveredfactory.net/api/1.0/?format=json) 
([source](https://github.com/sc3/cookcountyjail)).

# Getting started

Clone the repository:

``` 
git clone git://github.com/sc3/26thandcalifornia.git 
```

Open the `index.html` file in your browser. Firefox+Firebug or Chrome
are highly recommended.

Open `index.html` in your text editor. We're off to the races.

# A tour of the app

Let's take a whirlwind tour of the app. We'll mostly follow the execution 
order of our application from the time `index.html` is opened in the browser.

The application layout is heavily based on ["Organizing your application
using Modules](http://backbonetutorials.com/organizing-backbone-using-modules/) 
by Thomas Davis.


## index.html

`index.html` is almost (see [issue 4](https://github.com/sc3/26thandcalifornia/issues/4)) 
trivially short, and hopefully won't have to change much -- it's just a
simple shell to fire up our app.

There's only truly one crucial line, the last thing in the `<head>` of the
document:

```html
<!-- 
Load RequireJS. The `data-main` attribute specifies the file
RequireJS will use as an entry point, such as `js/main.js`. Basic
configuration and application loading happens there.
// -->
<script data-main="js/main" src="lib/require.js"></script>
```

RequireJS provides a system for intelligently loading Javascript
libraries and applications. RequireJS implements a somewhat
controversial system known as Asynchronous Module Definitions. While AMD
may not be "the answer" for modular Javascript development, it provides
us with a sensible framework for building a Backbone app.

In all events, the `data-main="js/main` attribute tells RequireJS to use
the file called `js/main.js` to handle bootstrapping our application.

## js/main.js

At this point, RequireJS has loaded `js/main.js`:

```javascript
// Inmate URL configuration variable
var INMATE_URL = 'http://cookcountyjail.recoveredfactory.net/api/1.0/countyinmate/?format=jsonp';

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

// Load our application by requiring it, then calling it's
// initialize method.
require([
    'app',
], function(App){
    App.initialize();
});
```

First, we set a constant. Then we update the RequireJS configuration by
calling `require.config()`.

Finally, we encounter our first instance of RequireJS's loading syntax.
Let's take a look at it in a little more detail:

```javascript
require([ // List of modules to load
    'app', // Load app.js (relative to main.js)
], function(App){ // Callback once modules are loaded
    App.initialize(); // Call our app's initialize method
});
```

The `require` function takes two parameters: A list of module names and
a callback function that takes the loaded modules as its parameters.

Here's the general pattern we'll use to define modules, load libraries,
and do stuff:

```javascript
require([
  'module1',
  'module2'
], function(module1, module2) {
  module1.dosomething();
  module2.load({'config': 'value'});
}
```

Modules are relative to the directory used by `main.js`, unless aliases
are configured as they are in our example. So including 'module1' in our
list will load `js/module1.js`, and `foo/bar/baz` will load
`js/foo/bar/baz.js`. 

The callback function takes each module as its arguments. So how do we
define a module? Let's look at `js/app.js` to see how to expose an
application interface using RequireJS and to get into the meat of our
app.

## js/app.js

Up to this point, we've just been loading files. Now we're ready to look
at the meat of the application.

```
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

    // Templates
    'text!templates/about.html',

], function($, _, Backbone, InmateModel, InmateCollection, InmateTableView, MenuView, PageView, about) {

    // Add a "fetch" event to signal start of collection AJAX call.
    var oldCollectionFetch = Backbone.Collection.prototype.fetch;
    Backbone.Collection.prototype.fetch = function(options) {
        this.trigger("fetch");
        oldCollectionFetch.call(this, options);
    }

    // Application routes
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'inmates',
            'inmates': 'inmates',
            'about': 'about'
        }
    });

    // Initialize
    var initialize = function() {
        var router = new AppRouter();

        // Render inmate table view on 'inmates' navigation event
        var inmates = new InmateTableView({collection: new InmateCollection()});
        router.on('route:inmates', function() {
            // InmateTableView.render() is triggered after fetching the data.
            inmates.collection.fetch();
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
```

There's a lot going on in this file, so let's step back at look at the
big picture and then drill down into the actual Backbone app. 

```javascript
// myapp.js
require([
  'jquery',
  'underscore'
], function($, _) {
  var initialize = function() { 
    console.log('init!');
  }
  
  return {
    initialize: initialize
  }
}
```

## models

## collections

## views

## Overall structure
