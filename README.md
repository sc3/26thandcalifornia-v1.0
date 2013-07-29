# 26th and California

A Javascript app to browse and visualize data from the Supreme
Chi-Town Coding Crew's [Cook County Jail API](http://cookcountyjail.recoveredfactory.net/api/1.0/?format=json) 
([source](https://github.com/sc3/cookcountyjail)).

# Install and run server

Clone the repo:
    git clone git://github.com/sc3/26thandcalifornia.git 

If you have Python, start a local server:
    cd 26thandcalifornia/app
    python -m SimpleHTTPServer

Now visit http://localhost:8000 in your web browser.

# Deployment

You'll need s3cmd. In OS X you can `brew install s3cmd` and in Ubuntu `sudo apt-get install s3cmd`
should do the trick.

Configure s3cmd with your credentials:
    s3cmd --configure

Now run deploy.sh to sync files:
    ./deploy.sh

# Development

See TOUR.md for now.
