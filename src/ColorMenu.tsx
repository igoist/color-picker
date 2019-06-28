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
 * tmpCMTop:
 * tmpCMLeft: 两者跟下面两个稍微有点区别，最后 setState 时候补上 'px'
 * tmpTop: top of pickerBtn1
 * tmpLeft: left of pickerBtn1
 * tmpGauche: left of pickerBtn2
 * tmpH: hsb.h
 * tmpHexValue: ...
 * tmpSwitchFlag: 标记 ClipView 是否显示，或者干脆就当开关好了
 */

let hsb = {
  h: 0,
  s: 100,
  b: 100
};

let tmpCMTop: number = 175;
let tmpCMLeft: number = 360;
let tmpTop: string = '0px';
let tmpLeft: string = '232px';
let tmpGauche: string = '0px';
let tmpH: number = 0;
let tmpHexValue: string = 'ff0000';

let tmpSwitchFlag: boolean = false;

interface StartPoint {
  x: number;
  y: number;
  moved: boolean;
}

let tmpStartPoint: StartPoint = {
  x: 0,
  y: 0,
  moved: false
};

interface BindMoveConfig {
  el: any;
  handleMove: any;
  flag?: string;
}

const bindMove = (config: BindMoveConfig) => {
  const { el, handleMove, flag } = config;
  el.addEventListener('mousedown', (e: MouseEvent) => {
    if (!flag) {
      handleMove(e);
    } else if (flag === 'HandleColorMenuDrag') {
      tmpStartPoint = {
        x: e.pageX,
        y: e.pageY,
        moved: false
      };
    }

    document.addEventListener('mousemove', handleMove);

    const mouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseup', mouseUp);

      if (flag === 'HandleColorMenuDrag') {
        tmpStartPoint.moved = false;
      }
    };

    document.addEventListener('mouseup', mouseUp);
  });
};

interface PropTrick {
  dispatch?: any;
  switch: boolean;
}

const ColorMenu = (props: PropTrick) => {
  const cmWrapRef = React.useRef<HTMLDivElement>(null);
  const cmTopRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const scrollbarRef = React.useRef<HTMLDivElement>(null);

  let rect: (ClientRect | DOMRect | null) = null;
  let rectScrollbar: (ClientRect | DOMRect | null) = null;

  const [state, setState] = React.useState({
    cmTop: tmpCMTop + 'px',
    cmLeft: tmpCMLeft + 'px',
    top: tmpTop,
    left: tmpLeft,
    gauche: tmpGauche,
    h: tmpH,
    hexValue: tmpHexValue
  });

  const handlePickerBtnMove = (e: MouseEvent) => {
    const panel = panelRef.current;
    let w = panel.offsetWidth;
    let h = panel.offsetHeight;

    // it would change every time the scrolling position changes, but we can use it here
    rect = panel.getBoundingClientRect();

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
      cmTop: tmpCMTop + 'px',
      cmLeft: tmpCMLeft + 'px',
      top: tmpTop,
      left: tmpLeft,
      gauche: tmpGauche,
      h: tmpH,
      hexValue: tmpHexValue
    });
  };

  const handleHueBtnMove = (e: MouseEvent) => {
    const scrollbar = scrollbarRef.current;
    rectScrollbar = scrollbar.getBoundingClientRect();

    let w = rectScrollbar.width - 10; // trick value

    let l: number = (e.pageX - 5) - rectScrollbar.left; // 5 is another trick

    l = l > w ? w : l;
    l = l < 0 ? 0 : l;

    hsb.h = Math.ceil(l / w * 360);

    tmpGauche = l + 'px';
    tmpH = hsb.h;
    tmpHexValue = RGBToHEX(HSBToRGB(hsb));

    setState({
      cmTop: tmpCMTop + 'px',
      cmLeft: tmpCMLeft + 'px',
      top: tmpTop,
      left: tmpLeft,
      gauche: tmpGauche,
      h: tmpH,
      hexValue: tmpHexValue
    });
  };

  const handleDrag = (e: MouseEvent) => {
    let { pageX, pageY } = e;

    if (!tmpStartPoint.moved) {
      if (Math.abs(tmpStartPoint.x - pageX) > 2 || Math.abs(tmpStartPoint.y - pageY) > 2) {
        tmpStartPoint.moved = true;
      }
    }

    if (!tmpStartPoint.moved) {
      return ;
    }

    tmpCMTop += pageY - tmpStartPoint.y;
    tmpCMLeft += pageX - tmpStartPoint.x;

    tmpStartPoint.y = pageY;
    tmpStartPoint.x = pageX;

    setState({
      cmTop: tmpCMTop + 'px',
      cmLeft: tmpCMLeft + 'px',
      top: tmpTop,
      left: tmpLeft,
      gauche: tmpGauche,
      h: tmpH,
      hexValue: tmpHexValue
    });
  };

  React.useEffect(() => {
    const cmWrap = cmWrapRef.current;

    cmWrap.addEventListener('mouseover', () => {
      props.dispatch({ type: 'hide' });
    });

    cmWrap.addEventListener('mouseleave', () => {
      props.dispatch({ type: 'show' });
    });

    bindMove({
      el: cmTopRef.current,
      handleMove: handleDrag,
      flag: 'HandleColorMenuDrag'
    })

    bindMove({
      el: panelRef.current,
      handleMove: handlePickerBtnMove,
    });

    bindMove({
      el: scrollbarRef.current,
      handleMove: handleHueBtnMove,
    });
  }, []);

  return (
    <div id='cm-wrap'
      style={{
        top: state.cmTop,
        left: state.cmLeft
      }}
      ref={ cmWrapRef }
    >
      <div id='cm'>
        <div className='cm-top' ref={ cmTopRef }></div>
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
          <div className={ `picker-switch${ props.switch ? ' active' : '' }` } onClick={() => {
            tmpSwitchFlag = !tmpSwitchFlag;
            props.dispatch({ type: 'switch', flag: tmpSwitchFlag });
          }}></div>
          <div className='color-preview'
            style={{
              backgroundColor: `#${ state.hexValue }`
            }}
          ></div>
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
