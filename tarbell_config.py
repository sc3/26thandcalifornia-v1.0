# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

# Short project name
NAME = "crypto"

# Descriptive title of project
TITLE = "Exploring Encryption"

# Google spreadsheet key
#SPREADSHEET_KEY = "None"

# S3 bucket configuration
#S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    # "mytarget": "s3://mys3url.bucket.url/some/path"
#}

# Repository this project is based on (used for updates)
TEMPLATE_REPO_URL = "https://github.com/newsapps/tarbell-template"

# Import ordered dict, necessary for setting default context without
# Google spreadsheet.
try:
    OrderedDict()
except NameError:
    from ordereddict import OrderedDict

# Default template variables
DEFAULT_CONTEXT = {
    'data': [   {   'born': 2535.0,
                    'died': 33604.0,
                    'name': u'Grace Hopper'},
                {   'born': 4244.0,
                    'died': 33386.0,
                    'name': u'Ethel Payne'}],
    'headline': u'Ida Tarbell quote',
    'intro': u'Rockefeller and his associates did not build the Standard Oil Co. in the board rooms of Wall Street banks. They fought their way to control by rebate and drawback, bribe and blackmail, espionage and price cutting, by ruthless ... efficiency of organization.',
    'name': 'crypto',
    'quote': u"To know every detail of the oil trade, to be able to reach at any moment its remotest point, to control even its weakest factor \u2014 this was John D. Rockefeller's ideal of doing business. It seemed to be an intellectual necessity for him to be able to direct the course of any particular gallon of oil from the moment it gushed from the earth until it went into the lamp of a housewife. \n\nThere must be nothing \u2014 nothing in his great machine he did not know to be working right. It was to complete this ideal, to satisfy this necessity, that he undertook, late in the seventies, to organise the oil markets of the world, as he had already organised oil refining and oil transporting.",
    'quote_author': u'Ida Tarbell, History of the Standard Oil Company',
    'title': 'Exploring Encryption'
}