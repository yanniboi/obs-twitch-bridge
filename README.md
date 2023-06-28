# OBS Websocket JS and Twitch CLI

This is a simple project that uses OBS Websocket JS and Twitch CLI to create a simple overlay for your stream.

## Requirements

- [NodeJS](https://nodejs.org/en/)
- [Twurple](https://twurple.js.org/)
- [obs-websocket-js](https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md)

## Build

- `npm install`
- `npm run build`

## Usage

- `node dist/index.js help` list of available commands
- `node dist/index.js scene [scenename]` change currently active scene (predefined options)
- `node dist/index.js chat [message]` send a message to twitch chat
- `node dist/index.js toggle` toggle camera and microphone
- `node dist/index.js toggleMute [input]` toggle mute of selected input (predefined options)
- `node dist/index.js record` start recording
- `node dist/index.js stop` stop recording
- `node dist/index.js list` debug command
