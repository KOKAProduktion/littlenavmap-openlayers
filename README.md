# littlenavmap-openlayers

[OpenLayers](https://openlayers.org/) implementation of the [albar965/littlenavmap](https://albar965.github.io/) local web service.

This implementation provides:
- A browser-based pan/zoomable littlenavmap-generated map
- User Aircraft follow logic if available
- Fixes and workarounds to work inside limited iframe environments (e.g. MSFS2020 VR)

## Structure

This JS application is built using node.js/webpack into a static HTML/JS package located at:

- [dist/Little Navmap/web/ol](dist/Little+Navmap/web/ol)

It is intended to be served via the LNM built-in web server.

## Installation

Build your own bundle or copy the above mentioned `ol` folder into your LNM installation's web directory

```
`Path/to/your/Little Navmap/web`
```

The application should become accessible as soon as the LNM server has started via the default LNM URL:

e.g. http://localhost:8965/ol/index.html

## Possible Issues & Concerns:
- Dirty/Incomplete renderings
- Redundant display of map data
- Higher load on LNM server
- Hacky LNM data retrieval
- Missing close zoom levels

## Credits

A huge, fat, THANK YOU, [@albar965](https://github.com/albar965) for providing this awesome, not so "little" software! :)

Thanks also to [@bymaximus](https://github.com/bymaximus) for sharing the MSFS2020 in-game panel projects which have inspired me to write this.
