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
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    "staging": "s3://apps.beta.tribapps.com/crypto/"
}

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
}
