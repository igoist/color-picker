import * as React from 'react';
import { ColorCovert } from 'Utils';

const { HSBToRGB, RGBToHEX } = ColorCovert;

(window as any).cc = ColorCovert;

/**
 * 这里特别说明一下，
 * Hook 方式，handle 函数中 state.xx 因为什么什么的缘故获得的值是初始值
 * 所以特地设定几个 tmp 寄存变量
 *
 * hsb: 临时存放 hsb
 * tmpTop: top of pickerBtn1
 * tmpLeft: left of pickerBtn1
 * tmpGauche: left of pickerBtn2
 * tmpH: hsb.h
 * tmpHexValue: ...
 */

let hsb = {
  h: 0,
  s: 0,
  b: 0
};

let tmpTop: string = '0px';
let tmpLeft: string = '0px';
let tmpGauche: string = '0px';
let tmpH: number = 0;
let tmpHexValue: string = 'ffffff';

interface BindMoveConfig {
  el: any;
  flag?: Boolean;
  handleMove: any;
}

const bindMove = (config: BindMoveConfig) => {
  const { el, handleMove } = config;
  el.addEventListener('mousedown', (e: MouseEvent) => {
    handleMove(e);

    document.addEventListener('mousemove', handleMove);

    const mouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mouseup', mouseUp);
  });
};

const ColorMenu = () => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const scrollbarRef = React.useRef<HTMLDivElement>(null);

  let w: number = 0;
  let h: number = 0;
  let rect: (ClientRect | DOMRect | null) = null;
  let rectScrollbar: (ClientRect | DOMRect | null) = null;

  const [state, setState] = React.useState({
    top: tmpTop,
    left: tmpLeft,
    gauche: tmpGauche,
    h: tmpH,
    hexValue: tmpHexValue
  });

  const handlePickerBtnMove = (e: MouseEvent) => {
    let t: number = e.pageY - rect.top;
    let l: number = e.pageX - rect.left;

    t = t > h ? h : t;
    t = t < 0 ? 0 : t;

    l = l > w ? w : l;
    l = l < 0 ? 0 : l;

    hsb.s = Math.ceil(l / w * 100); // or ~~(...)
    hsb.b = Math.ceil((h - t) / h * 100);

    tmpTop = t + 'px';
    tmpLeft = l + 'px';
    tmpHexValue = RGBToHEX(HSBToRGB(hsb));

    setState({
      top: tmpTop,
      left: tmpLeft,
      gauche: tmpGauche,
      h: tmpH,
      hexValue: tmpHexValue
    });
  };

  const handleHueBtnMove = (e: MouseEvent) => {
    let w = rectScrollbar.width - 10; // trick value

    let l: number = (e.pageX - 5) - rectScrollbar.left; // 5 is another trick

    l = l > w ? w : l;
    l = l < 0 ? 0 : l;

    hsb.h = Math.ceil(l / w * 360);

    tmpGauche = l + 'px';
    tmpH = hsb.h;
    tmpHexValue = RGBToHEX(HSBToRGB(hsb));

    setState({
      top: tmpTop,
      left: tmpLeft,
      gauche: tmpGauche,
      h: tmpH,
      hexValue: tmpHexValue
    });
  };

  React.useEffect(() => {
    bindMove({
      el: panelRef.current,
      handleMove: handlePickerBtnMove,
    });

    bindMove({
      el: scrollbarRef.current,
      handleMove: handleHueBtnMove,
    });

    const panel = panelRef.current;
    w = panel.offsetWidth;
    h = panel.offsetHeight;

    // it would change every time the scrolling position changes, but we can use it here
    rect = panel.getBoundingClientRect();

    const scrollbar = scrollbarRef.current;
    rectScrollbar = scrollbar.getBoundingClientRect();
  }, []);

  return (
    <div id='cm-wrap'>
      <div id='cm'>
        <div className='cm-top'></div>
        <div className='cm-panel-wrap'>
          <div
            className='cm-panel'
            ref={ panelRef }
            style={{
              backgroundColor: `rgb(${ HSBToRGB({ h: state.h, s: 100, b: 100 }).r }, ${ HSBToRGB({ h: state.h, s: 100, b: 100 }).g }, ${ HSBToRGB({ h: state.h, s: 100, b: 100 }).b })`
            }}
          >
            <div className='saturation-w'></div>
            <div className='saturation-b'></div>

            <div className='picker-btn'
              style={{
                top: state.top,
                left: state.left
              }}
            ></div>
          </div>
        </div>
        <div className='cm-panel-bar'>
          <div className='hue-scrollbar' ref={ scrollbarRef }>
            <div className='hue-picker'
              style={{
                left: state.gauche
              }}
            ></div>
          </div>
        </div>
        <div className='cm-panel-x'>
          <p>#{ state.hexValue }</p>
        </div>
      </div>
    </div>
  );
}

export default ColorMenu;
