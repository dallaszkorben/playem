#!/usr/bin/shell
for f in `find .`; do mv -v "$f" "`echo $f | tr '[A-Z]' '[a-z]'`"; done