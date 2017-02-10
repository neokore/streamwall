# Streamwall

Web interface that compounds speaker's screen and webcam video to improve your events streaming appearance using WebRTC.

## How to use
1. Edit the `config.js` file and put the host local IP on it
2. Customize the css or replace the `logo.png` and `bg.jpg` files.
3. Execute `npm start` and type your sudo password (to be able to use the local 443 port)
4. Visit the printed URL with the needed computers
5. Stream this window using your favourite service and enjoy!

## Compatibility

### Google Chrome
Version 34+. Needs to be launched using the `--enable-usermedia-screen-capturing` flag.

### Mozilla Firefox
Version 50+. Needs to add your domain into the `media.getusermedia.screensharing.allowed_domains` key on `about:config` or use the Aurora or Firefox Developer Edition.

## Credits
Background image by [Max Ostrozhinskiy](https://unsplash.com/@maxon).
