#!/bin/bash
#
# Used to update data git
#
./main.sh
cd data
git add .
git commit -m "`date "+Update to %Y-%m-%d"`"
git push
exit
