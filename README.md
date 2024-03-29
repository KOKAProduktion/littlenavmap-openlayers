
![littlenavmap-openlayers](https://user-images.githubusercontent.com/3401839/111709528-0c47ff80-8848-11eb-9ab8-41629c65feec.png)

# littlenavmap-openlayers

[OpenLayers](https://openlayers.org/) web UI implementation of the [albar965/littlenavmap](https://albar965.github.io/) local web service.

This implementation provides:
- A browser-based pan/zoomable littlenavmap-generated tile map
- Toggleable user aircraft follow logic if available
- Fixes and workarounds to work inside limited iframe environments (e.g. MSFS2020 VR)

**State:** Prototype

Follow discussion at: [LNM - OpenLayers Integration Roadmap](https://github.com/albar965/littlenavmap/discussions/677)

## Structure

This JS application is built using node.js/webpack into a static HTML/JS package located at:

- [dist/Little Navmap/web/ol](https://github.com/KOKAProduktion/littlenavmap-openlayers/tree/master/dist/Little%20Navmap/web/ol)

It is intended to be served via the LNM built-in web server. 

## Installation

Little Navmap **Version 2.6.10 (Revision 9e09a8a9)**

Build your own bundle or copy the above mentioned `ol` folder into your LNM installations web directory

```
`Path/to/your/Little Navmap/web`
```

The application should become accessible as soon as the LNM server has started via the default LNM URL:

e.g. http://localhost:8965/ol/index.html

To allow aircraft progress tracking LNM position format must be set to GPS (deg,mins,secs,direction) in its settings and [Position display must be turned on](https://github.com/KOKAProduktion/littlenavmap-openlayers/issues/2#issue-1144685238)

## MSFS2020 Support

This application can be embedded as an MSFS2020 in-game panel via [msfs2020-littlenavmap-openlayers](https://github.com/KOKAProduktion/msfs2020-littlenavmap-openlayers)

## Possible Issues & Concerns:
- Dirty/Incomplete renderings
- Redundant display of map data
- Higher load on LNM server
- Hacky data retrieval from LNM 
- Missing close zoom levels
- No clickable features
- Displayed LNM position data must be GPS (deg,mins,secs,direction)
- Mercator projection only

## Credits

A huge, fat, THANK YOU, [@albar965](https://github.com/albar965) for providing this awesome, not so "little" software! :)

Thanks also to [@bymaximus](https://github.com/bymaximus) for sharing the MSFS2020 in-game panel projects which have inspired me to write this.
