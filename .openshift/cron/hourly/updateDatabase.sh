#!/bin/bash
hour=$(TZ=Asia/Taipei date '+%H')
weekday=$(TZ=Asia/Taipei date '+%w')
if [ $hour != 17 || $weekday = 0 || $weekday = 6 ]; then
    exit
fi

year=$(($(TZ=Asia/Taipei date '+%Y')-1911))
today=$year-$(TZ=Asia/Taipei date '+%m-%d')

xmlFile=${OPENSHIFT_TMP_DIR}$today.xml
wget http://kong0107.github.io/ey-gazette-data/$year/$today/$today.xml -O $xmlFile

scriptFile=${OPENSHIFT_DATA_DIR}import2mongo.js
wget https://github.com/kong0107/ey-gazette/raw/master/import2mongo.js -O $scriptFile

node $scriptFile $today $xmlFile
