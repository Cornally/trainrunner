trainrunner
===========

SimplyJS Pebble App for MetroNorth

# Getting Started #

Head to SimplyJS.io and install their app runner on your device.  Point their app to the index.js file included in this repo.

To modify the destination & origin stations, you can modify the json url's parameters immediately following "Trainstatus" in the following url:

e.g. GCT to Fairfield Metro:
http://ws.nee1983.org/ws/Trainstatus/1/188/2014/6/18/2000/5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json?_=1403139502881

The first parameter, "1" corresponds to GCT (origin)
The second parameter, "188" corresponds to Fairfield Metro (Destination)

I borrowed the feed from the official Grand Central Terminal application and the structure above may change without notice.  There are grumblings of an official API being released in the future.  Until then, this solution remains brittle.
