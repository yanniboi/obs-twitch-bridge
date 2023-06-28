#!/usr/bin/node
import {InputItem, InputMap, ObsError, SceneItem, SceneMap, TokenData} from './types';

require('dotenv').config();

const OBSWebSocket = require('obs-websocket-js').default;
const {ChatClient} = require('@twurple/chat');
const {ApiClient} = require('@twurple/api');

const {RefreshingAuthProvider} = require('@twurple/auth');
const fs = require('fs');
const tokenFile = process.env.TOKEN_PATH;

const allowedCommands = [
  'help',
  'scene',
  'chat',
  'list',
  'toggle',
  'toggleMute',
  'record',
  'stop',
];

const sceneMap: SceneMap = {
  "starting": "Starting",
  "chatting": "Chatting",
  "linux": "Main - Linux",
  "windows": "Main - Windows",
  "android": "Main - Android",
};

const inputMap: InputMap = {
  "desktop": {
    "name": "Desktop Audio",
    "kind": "pulse_output_capture",
  },
  "mic": {
    "name": "Mic/Aux",
    "kind": "pulse_input_capture",
  },
  "external": {
    "name": "Mic/Aux",
    "kind": "pulse_input_capture",
  },
  "jazz": {
    "name": "Jaaaazzzz",
  }
}

const args = process.argv;
const command = args[2];


const obs = new OBSWebSocket();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;


const obsUrl = process.env.OBS_URL;
const obsPassword = process.env.OBS_PASSWORD;

const tokenData = JSON.parse(fs.readFileSync(tokenFile, 'UTF-8'));
const authProvider = new RefreshingAuthProvider(
  {
    clientId,
    clientSecret,
    onRefresh: async (newTokenData: TokenData) => fs.writeFileSync(tokenFile, JSON.stringify(newTokenData, null, 4), 'UTF-8')
  },
  tokenData
);

const chatClient = new ChatClient({
  authProvider,
  channels: ['yanni_boi'],
  logger: {
    minLevel: 'debug'
  }
});


async function main() {
  if (!isValidCommand()) {
    console.error("No command provided - try help.")
    return;
  }

  try {
    await processCommand()
  } catch (error: ObsError | any) {
    console.error('Failed to connect', error.code, error.message);
    await obs.disconnect();
  }

}

async function processCommand() {
  switch (command) {
    case 'scene':
      await obs.connect(obsUrl, obsPassword);
      await switchScene(args[3]);
      await obs.disconnect();
      break;

    case 'chat':
      await sendChatMessage(args[3]);
      break;

    case 'record':
      await obs.connect(obsUrl, obsPassword);
      await startRecording();
      await obs.disconnect();
      break;

    case 'stop':
      await obs.connect(obsUrl, obsPassword);
      await stopRecording();
      await obs.disconnect();
      break;

    case 'list':
      await obs.connect(obsUrl, obsPassword);
      await listSources();
      await obs.disconnect();
      break;

    case 'toggle':
      await obs.connect(obsUrl, obsPassword);
      await toggleMute('mic');
      await toggleVisibility();
      await obs.disconnect();
      break;

    case 'toggleMute':
      await obs.connect(obsUrl, obsPassword);
      await toggleMute(args[3]);
      await obs.disconnect();
      break;

    default:
      console.log("List of commands:")
      console.log(allowedCommands);
  }
}

function isValidCommand() {
  return (allowedCommands.indexOf(command) !== -1);
}

async function sendChatMessage(message: string) {
  await chatClient.connect();
  chatClient.onJoin(async (channel: string, user: string) => {
    await chatClient.say(channel, message);
    await chatClient.quit();
  });
}

async function switchScene(sceneName: string) {
  if (!sceneMap[sceneName]) {
    console.error("Invalid scene name");
    return;
  }

  await obs.call('SetCurrentProgramScene', {'sceneName': sceneMap[sceneName]});
}

async function toggleVisibility() {
  const response = await obs.call('GetSceneItemList', {sceneName: "CameraGroup"});
  response.sceneItems.forEach(async (item: SceneItem) => {
    await obs.call('SetSceneItemEnabled', {
      'sceneName': 'CameraGroup',
      'sceneItemId': item.sceneItemId,
      'sceneItemEnabled': !item.sceneItemEnabled,
    });
  });
}

async function toggleMute(toggleName: string) {
  if (!inputMap[toggleName]) {
    console.error("Invalid input name");
    return;
  }

  const itemName = inputMap[toggleName].name;

  await obs.call('ToggleInputMute', {
    'inputName': itemName,
  });
}

async function startRecording() {
  await obs.call('StartRecord');
}

async function stopRecording() {
  await obs.call('StopRecord');
}

async function getItemsInScene(sceneName: string) {
  const list = await obs.call('GetSceneItemList', {sceneName: 'Starting'});
  const names = list.sceneItems.map((item: SceneItem) => item.sourceName);
  console.log(names)
}

async function listSources() {

  // const list = await obs.call('GetInputList', {inputKind: 'v4l2_input'});
  const list = await obs.call('GetInputList');
  const inputNames = list.inputs.map((input: InputItem) => input.inputName);
  const inputKinds = list.inputs.map((input: InputItem) => input.inputKind);
  const distinctInputKinds = [...new Set(inputKinds)];
  console.log(distinctInputKinds);
  console.log(inputNames);

  return;

  const {scenes, currentProgramSceneName} = await obs.call('GetSceneList');

  // Log a list of all scene names.
  console.log(scenes);

  // Log all the items (/sources) in the current scene.
  await getItemsInScene(currentProgramSceneName);
}

main();
