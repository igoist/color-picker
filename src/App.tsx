import * as React from 'react';
import getScreenSources from './desktop-capturer';

import { getCurrentScreen } from 'Utils';

import ColorMenu from './ColorMenu';

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

/**
 * radius: ClipView 中 canvas 实际半径（统一设置为 dp = 2）
 * range: 每个像素格在 canvas 中大小（size）
 * clipRange: 向上取整(直径 / range)
 * tmpClipData: 取色区域数据
 * tmpCenterValue: 存放取色中心点数值
 * tmpIfShow:
 * tmpSwitchFlag: ... 两边初始值需要相同
 */
const body = document.body;
const radius = 176;
const borderSize = 2;
const range = 21;
const clipRange = Math.ceil((2 * radius) / range);
let tmpClipData: (string[] | null) = null;

let tmpTop: string = `-${ 190 }px`;
let tmpLeft: string = `-${ 190 }px`;
let tmpCenterValue: string = '';
let tmpIfShow = true;
let tmpSwitchFlag = false;
let position: { x?: number, y?: number } = null;


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
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = 'rgba(255,255,255,0.618)';
      ctx.fillStyle = clipData[i];
      ctx.fillRect(x * range + resize, y * range + resize, range, range);
      ctx.strokeRect(x * range + resize, y * range + resize, range, range);
      ctx.restore();
      ctx.lineWidth = 0.2;
      ctx.strokeStyle = 'rgba(0,0,0,0.618)';
      ctx.strokeRect(x * range + resize, y * range + resize, range, range);
      ctx.restore();
    }
  }
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = clipData[current];
  ctx.fillRect(cp.x, cp.y, range, range);
  ctx.strokeRect(cp.x, cp.y, range, range);
  ctx.restore();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';
  ctx.strokeRect(cp.x, cp.y, range, range);
  ctx.restore();
}

interface HelloProps { value: any; }

class TmpC extends React.Component<HelloProps> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className='tmp-cb'
        style={{ backgroundColor: this.props.value }}
      >
      </div>
    )
  }
}

const ClipView = () => {
  const cE = React.useRef(null);

  const [state, setState] = React.useState({
    top: tmpTop,
    left: tmpLeft,
    value: '#FFFFFF',
    show: tmpIfShow,
    switch: tmpSwitchFlag
  });

  const reducer = (action: any) => {
    switch (action.type) {
      case 'show':
        tmpIfShow = true;
        setState({
          top: tmpTop,
          left: tmpLeft,
          value: tmpCenterValue,
          show: true,
          switch: tmpSwitchFlag
        });
        break;
      case 'hide':
        tmpIfShow = false;
        setState({
          top: tmpTop,
          left: tmpLeft,
          value: tmpCenterValue,
          show: false,
          switch: tmpSwitchFlag
        });
        break;
      case 'switch':
        tmpSwitchFlag = action.flag;
        if (tmpSwitchFlag) {
          document.body.classList.add('with-clip-view');
        } else {
          document.body.classList.remove('with-clip-view');
        }
        setState({
          top: tmpTop,
          left: tmpLeft,
          value: tmpCenterValue,
          show: tmpIfShow,
          switch: tmpSwitchFlag
        });
        break;
      default:
        console.log('error in reducer ClipView');
        throw new Error;
    }
  }




  const onMouseMove = (e: any) => {
    position = {
      x: e.clientX - body.offsetLeft,
      y: e.clientY - body.offsetTop
    };

    if (tmpCanvasData) {
      tmpClipData = getClipData({
        position: position,
        imgData: tmpCanvasData,
      });

      tmpTop = `${ position.y - 80 - borderSize - 9 }px`;
      tmpLeft = `${ position.x - 80 - borderSize - 9 }px`;
      // 不可以在 drawPoint 设置 tmpCenterValue
      tmpCenterValue = tmpClipData[~~(tmpClipData.length / 2)].toUpperCase();

      setState({
        top: tmpTop,
        left: tmpLeft,
        value: tmpCenterValue,
        show: tmpIfShow,
        switch: tmpSwitchFlag
      });
    }
  }

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Unbind body\'s mousemove');
      body.removeEventListener('mousemove', onMouseMove);
    }

    body.addEventListener('mousemove', onMouseMove);
    body.addEventListener('click', () => {
      console.log('click: ', tmpCenterValue);
    });
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
    <div>
      <div
        className='clip-view'
        style={{
          display: state.switch && state.show ? '' : 'none',
          top: state.top,
          left: state.left,
          // backgroundColor: '#CCCFFF' // this line for code test
        }}
      >
        <canvas ref={ cE } width={ radius * 2 } height={ radius * 2 }></canvas>
        <span>{ state.value }</span>
      </div>

      {
        state.switch && <TmpC value={ state.value } />
      }

      <ColorMenu dispatch={ reducer } switch={ state.switch } />
    </div>
  )
}


const App = () => (
  <div>
    <ClipView />
    <p>SSds</p>
  </div>
);

export default App;
