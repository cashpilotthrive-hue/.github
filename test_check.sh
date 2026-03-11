#!/bin/bash
pkg="curl"
if dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q 'ok installed'; then
    echo "$pkg is installed"
else
    echo "$pkg is NOT installed"
fi

pkg="nonexistent-package-bolt"
if dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q 'ok installed'; then
    echo "$pkg is installed"
else
    echo "$pkg is NOT installed"
fi
