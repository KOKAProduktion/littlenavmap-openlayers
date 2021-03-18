# littlenavmap-openlayers

[OpenLayers](https://openlayers.org/) implementation of the [albar965/littlenavmap](https://albar965.github.io/) local web service.

This implementation provides:
- A browser-based pan/zoomable littlenavmap-generated map
- User Aircraft follow logic if available
- Fixes and workarounds to work inside limited iframe environments (e.g. MSFS2020 VR)

## Structure

This JS application is built using node.js/webpack into a static HTML/JS package located at:

- [dist/Little Navmap/web/ol](dist/Little+Navmap/web/ol)

## Installation

Build your own bundle or copy the above mentioned `ol` folder into your LNM installation's web directory

```
`Path/to/your/Little Navmap/web`
```

The application should become accessible as soon as the LNM server has started via the default LNM URL:

e.g. http://localhost:8965/ol/index.html

Issues & Concerns:
- Dirty/Incomplete renderings
- Redundant display of map data
- Higher load on LNM server
- Hacky LNM data retrieval
- Missing close zoom levels