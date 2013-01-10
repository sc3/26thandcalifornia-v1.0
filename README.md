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

The application layout is heavily based on [Organizing your application
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
calling `require.config()`. Finally, we encounter our first instance of
RequireJS's loading syntax.

Let's take a look at it in a little more detail. If you know what's
going on, or just want to know how Backbone works, skip ahead to
[invoking Backbone](#invoking-backbone) in `js/app.js`.

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
at the substance of the application, a Backbone JS app.

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

To define a module that can be loaded by RequireJS, we need to return an
object: 

```javascript
// myapp.js
require([
  'jquery',
  'underscore'
], function($, _) {
  var rock_and_roll = function() { 
    $('#content').html('Initialized module.');
  }
  return {
    rock_and_roll: rock_and_roll
  }
}
```

To use this app from `main.js`, we would use something like this:

```
require([
  'myapp'
], function(MyApp) {
  MyApp.rock_and_roll();
}

Instead of exporting a `rock_and_roll()` method, our app exports a
method called initialize. Remember good ol' `main.js`? It ends with

```
 require([
    'app',
], function(App){
    App.initialize();
});
```

This imports our application and calls it's only method, initialize,
which does the work of loading a Backbone model.

Phew, that's a lot of mechanics. But they're pretty sane mechanics, and they 
flow through a single, simple pattern that encourages good app
architecture while making some common tasks easier.

<div id="invoking-backbone"></div>

Now for the fun part. Let's take a look at the app's callback function
body. For those skipping ahead, you should now be looking at the callback 
defined in `js/app.js`. 

Unless you know Backbone, just ignore this bit for now:

```
// Add a "fetch" event to signal start of collection AJAX call.
var oldCollectionFetch = Backbone.Collection.prototype.fetch;
Backbone.Collection.prototype.fetch = function(options) {
    this.trigger("fetch");
    oldCollectionFetch.call(this, options);
}
```

(If you do know Backbone, this adds a 'fetch' event to the start of
collection AJAX requests, handy for adding a loading spinner.)

The real fun starts in the next stanza, where we define our application routes. 
All web applications must contain some version of this idea -- you gotta map URLs to
a code execution path. Backbone provides us with a way of executing a
function or responding to an event triggered by navigating to a new URL 
using a simple syntax:

```
// Application routes
var AppRouter = Backbone.Router.extend({
    routes: {
        '': 'inmates',
        'inmates': 'inmates',
        'about': 'about'
    }
});
```

These are "hash routes" -- instead of URLs like
`http://mydomain.tld/inmates`, you use URLs like
`http://mydomain.tld/#inmates`. Backbone catches the anchor link, trys
to call a function that matches the 'value' side of the key-value pair,
and fires and event called `route:<value>`.

In our case, going to our web root (`''`) or `#inmates` should call a
function called `inmates` if it exists in the router object and trigger
the `route:inmates` event. Similarly, `#about` will call a function
called `about` if it exists and trigger a `route:about` event.

In the next code snippet, we're going to initialize our app by creating
a new instance of the router, instantiating some Backbone views, and
binding to route events:
 
```js
var initialize = function() {
    var router = new AppRouter();

    // Render inmate table view on 'inmates' navigation event
    var inmates = new InmateTableView();
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
}
```

As always, there's a pattern here:

* Create a new Backbone router object based on our router definition
* Create new Backbone views
* Bind routing events to functions that cause views to render.


## BREAK TIME

If this is a class, take a short break for Q&A. If you're reading along
at home, now would be a good time to refill your coffee or tea and take
a little walk.

## models

## collections

## views

## How do I hack on it?

Let's add a route to look at court locations:

First, create a file called `js/views/CourtLocationTableView.js`

Then, add it to the app's required modules:

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
    'views/CourtLocationTableView',
    'views/MenuView',
    'views/PageView',

    // Templates
    'text!templates/about.html'

], function($, _, Backbone, InmateModel, InmateCollection, InmateTableView, CourtLocationTableView, MenuView, PageView, about) {
// ...
```
 

Add your route to AppRouter:

```
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'inmates',
            'inmates': 'inmates',
            'about': 'about'
            'courtlocations': 'courtlocations'
        }
    });
```

Invoke the router from your initialize function:

```
        var courtlocations = new CourtLocationTableView();
        router.on('route:courtlocations', function() {
            courtlocations.render();
        });
```

In `js/views/CourtLocationTableView.js`, create a new RequireJS module
that returns a Backbone view.

```
define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone) {

    var CourtLocationTableView = Backbone.View.extend({
        el: '#content',
        render: function(options) {
            this.$el.html('<p>It's up to you to wire this up to a data source.</p>');
            return this;
        }
    });

    return CourtLocationTableView;

});
```





