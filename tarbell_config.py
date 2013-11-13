# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

# Short project name
NAME = "26thandcalifornia"

# Descriptive title of project
TITLE = "26th &amp; California"

# Google spreadsheet key
SPREADSHEET_KEY = "0Ak3IIavLYTovdExmUldWMVVDR3I5MWtFU01Nc054Mmc"

# Create JSON data at ./data.json, disabled by default
# CREATE_JSON = True

# S3 bucket configuration
S3_BUCKETS = {
     "staging": "s3://26thandcalifornia.recoveredfactory.net/staging/"
}

# Default template variables
DEFAULT_CONTEXT = {
    'name': '26thandcalifornia',
    'title': '26th & California'
}
