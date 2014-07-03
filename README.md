trainrunner
===========

A SimplyJS Pebble App for MetroNorth.  
Screenshots and a 3 minute read are available here https://medium.com/@cornally/smart-enough-watches-99ffa0f5c42b

# Getting Started #

1. Head to SimplyJS.io and install their app runner on your device.

2. Point their app to a remotely hosted copy of the index.js file included in this repo.

3. Launch SimplyJS on your Pebble

4. To modify the destination & origin stations, you can modify the json url's parameters immediately following "Trainstatus" in the following url:

e.g. GCT to Fairfield Metro:
http://ws.nee1983.org/ws/Trainstatus/1/188/2014/7/18/2000/5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json?_=1403139502881

The first parameter, "1" corresponds to GCT (origin)
The second parameter, "188" corresponds to Fairfield Metro (destination)

# Heads Up #

I borrowed the feed from the official Grand Central Terminal application and the structure above may change without notice.  There are grumblings of an official API being released in the future.  Until then, this solution remains brittle.  As for procuring useful origin/destination id's, you will have to comb the general transit feed specification (GTFS) data dump provided by the MTA after registering as a developer here: http://web.mta.info/developers/index.html.

Grab a zip file of their transit data and refer to stops.txt for ids.
