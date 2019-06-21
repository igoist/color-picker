import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import '../public/css/style.css';

import getScreenSources from './desktop-capturer';

import { getCurrentScreen } from './utils/';

let currentScreen = getCurrentScreen();
let scaleFactor = currentScreen.scaleFactor;
let screenWidth = currentScreen.bounds.width;
let screenHeight = currentScreen.bounds.height;

let tmpImg = new Image();
let tmpCanvas: HTMLCanvasElement = document.getElementById('tmp') as HTMLCanvasElement;
let tmpCanvasData: any = null;

getScreenSources({}, (imgSrc: any) => {

  let bgImg = document.getElementById('bgImg');

  bgImg.style.backgroundImage = `url(${ imgSrc })`;
  bgImg.style.backgroundSize = `${ screenWidth }px ${ screenHeight }px`;

  tmpImg.src = imgSrc;
  tmpImg.addEventListener('load', function() {
    tmpCanvas.width = tmpImg.width;
    tmpCanvas.height = tmpImg.height;
    let tmpContext: any = tmpCanvas.getContext('2d');

    tmpContext.drawImage(tmpImg, 0, 0, tmpImg.width, tmpImg.height);
    tmpCanvasData = tmpContext.getImageData(0, 0, tmpImg.width, tmpImg.height);
  }, false);
});

const body = document.body;
const radius = 80;
const borderSize = 2;
const range = 11;
const clipRange = Math.ceil((2 * radius) / range);
let tmpClipData: (string[] | null) = null;


interface GetClipDataConfig {
  position: { x: number, y: number };
  imgData: any;
}

const getClipData: any = (config: GetClipDataConfig) => {
  const { position, imgData } = config;
  let clipData = [];
  let [x, y] = [~~(position.x * scaleFactor - radius / range), ~~(position.y * scaleFactor - radius / range)];
  let data = imgData.data;

  let index, r, g, b, a;

  if (!data) return;
  (window as any).data = data;

  for (let i = 0; i < clipRange; i ++) {
    for (let j = 0; j < clipRange; j ++) {
      index = ~~((y + i) * imgData.width + x + j);
      r = data[index * 4 + 0];
      g = data[index * 4 + 1];
      b = data[index * 4 + 2];
      a = data[index * 4 + 3] / 255;
      clipData.push(`rgba(${r},${g},${b},${a})`);
    }
  }

  return clipData;
}

interface DrawPointConfig {
  canvasElement: any;
  clipData: any; //string[];
}

const drawPoint = (config: DrawPointConfig) => {
  const { canvasElement, clipData } = config;

  let ctx = canvasElement.getContext('2d');
  let resize = radius - range * clipRange / 2;
  let length = clipData.length;
  let current = ~~(length / 2);
  let x, y, cp: any = {};
  ctx.save();
  for (let i = 0 ; i < length; i ++) {
    y = ~~(i / clipRange);
    x = i - y * clipRange;
    if (i === current) {
      cp = {
        x: x * range + resize,
        y: y * range + resize
      };
    } else {
      ctx.lineWidth = 0.1;
      // ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.strokeStyle = 'rgba(5,5,5,0.4)';
      ctx.fillStyle = clipData[i];
      ctx.fillRect(x * range + resize, y * range + resize, range, range);
      ctx.strokeRect(x * range + resize, y * range + resize, range, range);
      ctx.restore();
    }
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fc04db';
  ctx.fillStyle = clipData[current];
  ctx.fillRect(cp.x, cp.y, range, range);
  ctx.strokeRect(cp.x, cp.y, range, range);
  ctx.restore();
}


const ClipView = () => {
  const cE = React.useRef(null);

  const [state, setState] = React.useState({ top: `-${ radius }px`, left: `-${ radius }px` });

  const onMouseMove = (e: any) => {
    let position = {
      x: e.clientX - body.offsetLeft,
      y: e.clientY - body.offsetTop
    };

    if (tmpCanvasData) {
      tmpClipData = getClipData({
        position: position,
        imgData: tmpCanvasData,
      });

      setState({
        top: `${ position.y - radius - borderSize }px`,
        left: `${ position.x - radius - borderSize }px`
      });
    }
  }

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Unbind body\'s mousemove');
      body.removeEventListener('mousemove', onMouseMove);
    }

    body.addEventListener('mousemove', onMouseMove);
  }, []);

  React.useEffect(() => {
    if (tmpClipData) {
      drawPoint({
        canvasElement: cE.current,
        clipData: tmpClipData
      });
    }
  });

  return (
    <div
      className='clip-view'
      style={{
        top: state.top,
        left: state.left,
        width: `${ 2 * radius + 2 * borderSize }px`,
        height: `${ 2 * radius + 2 * borderSize }px`,
        // backgroundColor: '#CCCFFF' // this line for code test
      }}
    >
      <canvas ref={ cE } width='160' height='160'></canvas>
      <span>#FFFFFF</span>
    </div>
  )
}


ReactDOM.render(
  <AppContainer>
    <div>
      <ClipView />
      <p>SSd</p>
    </div>
  </AppContainer>,
  document.getElementById('app')
);


if (module.hot) {
  module.hot.accept();
}
