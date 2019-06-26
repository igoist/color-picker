// const { remote, screen } = require('electron');
// import * as electron from 'electron';

// const { remote, screen } = electron;

import { remote, screen } from 'electron';

import * as ColorCovert from './color';

let currentWindow = remote.getCurrentWindow();

const getCurrentScreen = () => {
  let { x, y } = currentWindow.getBounds();
  return screen.getAllDisplays().filter((d: any) => d.bounds.x === x && d.bounds.y === y)[0];
}

const isCursorInCurrentWindow = () => {
  let { x, y } = screen.getCursorScreenPoint();
  let { x: winX, y: winY, width, height } = currentWindow.getBounds();
  return x >= winX && x <= winX + width && y >= winY && y <= winY + height;
}


export {
  getCurrentScreen,
  isCursorInCurrentWindow,
  ColorCovert
}
