#!/bin/bash
S3_BUCKET="26thandcalifornia.recoveredfactory.net"

echo "This software will overwrite the contents of ${S3_BUCKET}"
echo ""
read -p "Do you want to continue? [y/N] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    s3cmd sync --acl-public --delete-removed app/* s3://${S3_BUCKET}/
fi
