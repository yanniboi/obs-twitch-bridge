export type ObsError = {
  name: string;
}

export type SceneMap = {[key: string]: string}

type InputMapItem = {
  name: string;
  kind?: string;
}
export type InputMap = {[key: string]: InputMapItem}
export type SceneItem = {
  sourceName: string;
  sceneItemId: string;
  sceneItemEnabled: string;
}
export type InputItem = {
  inputName: string;
  inputKind: string;
}

export type TokenData = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  obtainmentTimestamp: number;
}