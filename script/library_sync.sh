#!/bin/bash

sourcepath="/Users/Vincent/drum-library"
targetpath="/Volumes/Vincent HDD/drumming"


cd $sourcepath

if [[ ! -d "$sourcepath" ]]; then
  echo "Info: $sourcepath doesn't exist => nothing to do"
  exit 0
fi

if [[ ! -d "$targetpath" ]]; then
  echo "Error: $targetpath doesn't exist"
  exit 1
fi

echo "Checking archive files..."
find "$sourcepath" -name 'archive.txt' | while read archive_source; do
  archivefile=${archive_source#$sourcepath}
  archive_target=`find "$targetpath" -path "*$archivefile"`

  source_count=`wc -l "$archive_source" | awk '{print $1}'`
  target_count=`wc -l "$archive_target" | awk '{print $1}'`

  if [ "$source_count" -lt "$target_count" ]; then
    echo "KO $archivefile (source: $source_count, target: $target_count)"
    echo "   Target archive has more content than the source one!"
    echo "   Please check them yourself. There should be a single source of truth"
    exit 1
  fi

  echo "OK $archivefile (source: $source_count, target: $target_count)"
done

rsync -auvh --progress --exclude=".*" "$sourcepath/"  "$targetpath"

git add .
git commit -m 'Update'
