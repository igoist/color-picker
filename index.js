const { BrowserWindow, ipcMain, globalShortcut, remote } = require('electron');
const fs = require('fs');
const os = require('os');
// const path = require('path');
const webpackConfig = require('./webpack/dev');

let captureWins = [];

const closeWindows = () => {
  if (captureWins.length) {
    captureWins.forEach(win => win.close());
    captureWins = [];
    globalShortcut.unregister('Esc');
    console.log('captureWin is closed, and unreg kb');
  }
};


const colorPicker = (e, args) => {
  // console.log(args);
  if (captureWins.length) {
    if (args && args.type) {
      console.log(args.type);
      args.ex && console.log(args.ex);
      switch (args.type) {
        case 'cancel':
          closeWindows();
          break;
        case 'complete':
          captureWins.forEach(win => win.hide());
          console.log('xx complete(wins hide)');
          closeWindows();
          break;
        case 'save':
          captureWins.forEach(win => win.hide());
          fs.writeFile(args.path, new Buffer(args.url.replace('data:image/png;base64,', ''), 'base64'), () => {
            console.log('.. should be downloaded');
            closeWindows();
          });
          break;
        case 'select':
          captureWins.forEach(win => win.webContents.send('capture-screen', { type: 'select', screenId: args.screenId }));
          break;
        case 'reset':
          captureWins.forEach(win => win.webContents.send('capture-screen', { type: 'reset' }));
          break;
        case 'hidden':
          captureWins.forEach(win => win.hide());
          break;
        case 'show':
          captureWins.forEach(win => win.show());
          break;
        default:
          break;
      }
    }
    return;
  }

  // !!! Cannot require 'screen' module before app is ready
  const { screen } = require('electron');

  let displays = screen.getAllDisplays();

  displays.map((display, index) => {
    // if (index === 0) {
    //   console.log(display.id);
    //   console.log(display);
    // }
    if (index !== 0) {
      return null;
    }

    console.log(display.bounds.width, display.bounds.height);
    let captureWin = new BrowserWindow({
      // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
      fullscreen: os.platform() === 'win32' || undefined,
      width: display.bounds.width,
      height: display.bounds.height,
      x: display.bounds.x,
      y: display.bounds.y,
      transparent: true,
      frame: false,
      skipTaskbar: true,
      autoHideMenuBar: true,
      movable: false,
      resizable: false,
      enableLargerThanScreen: true,
      hasShadow: false,
    });
    captureWin.setAlwaysOnTop(true, 'screen-saver');
    captureWin.setVisibleOnAllWorkspaces(true);
    captureWin.setFullScreenable(false);
    // captureWin.loadURL(`file://${ path.resolve(__dirname, './') }/index.html`);

    captureWin.loadURL(`http://localhost:${ webpackConfig.devServer.port }/index.html`);

    // captureWin.openDevTools()

    captureWin.on('closed', () => {
      console.log(`captureWindow xx is closing, and it should be released`);
      captureWin = null;
    });

    // return captureWin;
    captureWins.push(captureWin);
  });

  console.log('captureWins:', captureWins);;

  globalShortcut.register('Esc', () => {
    closeWindows();
  });
};

module.exports = {
  createTrayMenu: function() {
    return {
      label: "Screenshot",
      click: () => {
        colorPicker();
      }
    };
  },
  initPlugin: () => {
    console.log('ColorPicker InitPlugin');
    globalShortcut.register('CmdOrCtrl+Shift+A', colorPicker);

    ipcMain.on('color-picker', colorPicker);
  },
  initTray: () => {

  }
};
