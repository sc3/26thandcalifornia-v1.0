# 26th and California

## http://26thandcalifornia.recoveredfactory.net

A Javascript app to browse and visualize data from the Supreme
Chi-Town Coding Crew's [Cook County Jail API](http://cookcountyjail.recoveredfactory.net/api/1.0/?format=json) 
([source](https://github.com/sc3/cookcountyjail)).

# Install and run server

Clone the repo:

    git clone git://github.com/sc3/26thandcalifornia.git 

If you have Python, start a local server:

    cd 26thandcalifornia/app
    python -m SimpleHTTPServer

Now visit [`http://localhost:8000`](http://localhost:8000) in your web browser.

# Development

Create Backbone views based on our special `JailView` extended view object and
export them as AMD modules.

If you create a file called `views/StatisticsandmeasurementsView.js`, it will automatically be made
available at `#statisticsandmeasurements/`.

Here's a very basic view:

    define([
      'views/JailView',
    ],
    function(JailView) {
      var StatisticsandmeasurementsView = JailView.extend({
        render: function() {
          this.$el.html('Hello world');
          return this;
        }
      });
      return StatisticsandmeasurementsView;
    });

JailView objects can also accept a collection to load before rendering:

    define([
      'views/JailView',
      'collections/InmateCollection',
    ],
    function(JailView, InmateCollection) {
      var LoadcollectionView = JailView.extend({
        collection: new InmateCollection(),
        render: function() {
          this.$el.html('This renders once inmate data is retrieved.');
          return this;
        }
      });
      return LoadcollectionView;
    });


# Deployment

You'll need s3cmd. In OS X you can `brew install s3cmd` and in Ubuntu `sudo apt-get install s3cmd`
should do the trick.

Configure s3cmd with your credentials:
    s3cmd --configure

Now run deploy.sh to sync files:
    ./deploy.sh



