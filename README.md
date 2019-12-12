# Countdown GIF generator for emails and whatnot

Simple library to generate countdown GIFs in nodejs using Cairo/Canvas implementation usable for on-demand image generation.

## Image Options
* **width** - width in pixels [defaults to 200]
* **height** - height in pixels [defaults to 200]
* **color** - hex colour code for the text [defaults to ffffff]
* **bg** - hex colour code for the background [defaults to 000000]
* **frames** - number of frames (also number of seconds) the countdown will run before looping [defaults to 30]
* **fontSize** - size of font, recommended is width / 12, but play with this to see what looks good
* **fontFamily** - font family, see #More Fonts
* **fontStyle** - font style
* **expired** - expired text, blinking
* **quality** - final output quality

## Timer value
* **end** - Any momentjs parseable string, ideally JSON.stringify(new Date()) format [e.g. 2016-06-24T20:35:00.000Z]

## Default options
    width: 200,
    height: 200,
    color: 'ffffff',
    bg: '000000',
    frames: 30,
    fontSize: 26,
    fontFamily: 'Courier New',
    fontStyle: 'bold',
    expired: '00:00:00',
    quality: 90

## More fonts
```js
import { registerFont } from 'canvas'
registerFont(path, 'name')
ImageOptions.familyName = 'name'
```
## Package Size
The main dependency Cairo has around 30MB when installed on Mac.

## Samples
Attached webserver offers generating GIF into file or as direct output of express response (the fastest method of serving)

## License

[MIT](LICENSE)

## Inspired by
* [scottccoates](https://github.com/scottccoates/node-countdown-gif)
* [Nooshu](https://github.com/Nooshu/node-countdown-gif)
