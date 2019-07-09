import * as React from 'react';
import { ipcRenderer } from 'electron';
import { ColorCovert } from 'Utils';

const { HSBToRGB, RGBToHEX, RGBToHSB } = ColorCovert;

(window as any).cc = ColorCovert;

/**
 * 这里特别说明一下，
 * Hook 方式，handle 函数中 state.xx 因为什么什么的缘故获得的值是初始值
 * 所以特地设定几个 tmp 寄存变量
 *
 * hsb: 临时存放 hsb
 * rgb: ...
 * tmpCMTop:
 * tmpCMLeft: 两者跟下面两个稍微有点区别，最后 setState 时候补上 'px'
 * tmpTop: top of pickerBtn1
 * tmpLeft: left of pickerBtn1
 * tmpGauche: left of pickerBtn2
 * tmpH: hsb.h
 * tmpHexValue: ...
 * tmpSwitchFlag: 标记 ClipView 是否显示，或者干脆就当开关好了
 * tmpMode: RGB or HSB or ...
 */

let hsb = {
  h: 0,
  s: 100,
  b: 100
};

interface RGB {
  r: number;
  g: number;
  b: number;
}

let rgb: RGB = HSBToRGB(hsb);

let tmpCMTop: number = 175;
let tmpCMLeft: number = 360;
let tmpTop: string = '0px';
let tmpLeft: string = '232px';
let tmpGauche: string = '0px';
let tmpH: number = 0;
let tmpHexValue: string = 'ff0000';

let tmpHistoryArr: RGB[] = [];

let tmpSwitchFlag: boolean = false;
let tmpMode: number = 0;

const returnState = () => {
  return {
    cmTop: tmpCMTop + 'px',
    cmLeft: tmpCMLeft + 'px',
    top: tmpTop,
    left: tmpLeft,
    gauche: tmpGauche,
    h: tmpH,
    hexValue: tmpHexValue,
    historyArr: tmpHistoryArr,
    mode: tmpMode
  };
};

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
  props?: PropTrick;
}

const bindMove = (config: BindMoveConfig) => {
  const { el, handleMove, flag, props } = config;

  el.addEventListener('mousedown', (e: MouseEvent) => {
    if (!flag) {
      handleMove(e);
    } else if (flag === 'HandleColorMenuDrag') {
      tmpStartPoint = {
        x: e.pageX,
        y: e.pageY,
        moved: false
      };

      tmpSwitchFlag = false;
      props.dispatch({ type: 'switch', flag: false });
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

  const [state, setState] = React.useState(returnState());

  const handlePickerBtnMove = (e: MouseEvent) => {
    const panel = panelRef.current;

    // it would change every time the scrolling position changes, but we can use it here
    rect = panel.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;

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
    rgb = HSBToRGB(hsb);
    tmpHexValue = RGBToHEX(rgb);

    setState(returnState());
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
    rgb = HSBToRGB(hsb);
    tmpHexValue = RGBToHEX(rgb);

    setState(returnState());
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

    setState(returnState());
  };

  const handleRGB = (tmpRGB: RGB) => {
    rgb = tmpRGB;
    hsb = RGBToHSB(rgb);
    handleHSB();
  };

  // handle the 5: tmpTop, tmpLeft, tmpGauche, tmpH, tmpHexValue
  const handleHSB = () => {
    const scrollbar = scrollbarRef.current;
    rectScrollbar = scrollbar.getBoundingClientRect();
    let w = rectScrollbar.width - 10;

    tmpH = hsb.h;
    tmpGauche = tmpH / 360 * w + 'px';
    if (tmpMode === 1) {
      rgb = HSBToRGB(hsb);
    }
    tmpHexValue = RGBToHEX(rgb);


    const panel = panelRef.current;

    rect = panel.getBoundingClientRect();
    w = rect.width;
    let h = rect.height;

    let t = Math.ceil(h - hsb.b * h / 100);
    let l = Math.ceil(hsb.s * w / 100);

    tmpTop = t + 'px';
    tmpLeft = l + 'px';
  };

  const handleValueChange = () => {
    if (tmpMode === 0) {
      handleRGB(rgb);
    } else {
      handleHSB();
    }
  };

  const handleOnChange = (e: any, type: string) => {
    let tmpValue: number;
    if (e.target.value === '') {
      tmpValue = 0;
    } else {
      tmpValue = parseInt(e.target.value);
      tmpValue = tmpValue < 0 ? 0 : tmpValue;
    }
    if (tmpValue > 0 || tmpValue === 0) {
      if (tmpMode === 0) {
        if (tmpValue > 255) {
          tmpValue = 255;
        }
        switch(type) {
          case 'r':
            rgb.r = tmpValue;
            break;
          case 'g':
            rgb.g = tmpValue;
            break;
          case 'b':
            rgb.b = tmpValue;
            break;
        }
      } else {
        if (type === 'h') {
          if (tmpValue > 360) {
            tmpValue = 360;
          }
        } else {
          if (tmpValue > 100) {
            tmpValue = 100;
          }
        }
        switch(type) {
          case 'h':
            hsb.h = tmpValue;
            break;
          case 's':
            hsb.s = tmpValue;
            break;
          case 'b':
            hsb.b = tmpValue;
            break;
        }
      }

      handleValueChange();
      setState(returnState());
    }
  }

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
      flag: 'HandleColorMenuDrag',
      props: props
    })

    bindMove({
      el: panelRef.current,
      handleMove: handlePickerBtnMove,
    });

    bindMove({
      el: scrollbarRef.current,
      handleMove: handleHueBtnMove,
    });

    ipcRenderer.on('repeating-clip-view-value', (event: any, arg: any) => {
      handleRGB(arg.colorObj);

      tmpHistoryArr.unshift(rgb);
      if (tmpHistoryArr.length > 16) {
        tmpHistoryArr.pop();
      }

      setState(returnState());

      tmpSwitchFlag = false;
      props.dispatch({ type: 'switch', flag: tmpSwitchFlag });
    });

    ipcRenderer.on('color-picker-prepare-exit', (event: any, arg: any) => {
      ipcRenderer.send('color-picker-exit', tmpHistoryArr);
    });

    ipcRenderer.on('color-picker-update-history', (event: any, arg: any) => {
      tmpHistoryArr = arg;

      setState(returnState());
    });

    ipcRenderer.send('color-picker-init-complete');
  }, []);

  interface Action {
    type: string;
    value: number;
  }

  const reducer = (action: Action) => {
    switch (action.type) {
      case 'mode':
        tmpMode = action.value;
        setState(returnState());
        break;
      case 'default':
        break;
    }
  };

  return (
    <div id='cm-wrap'
      style={{
        top: state.cmTop,
        left: state.cmLeft
      }}
      ref={ cmWrapRef }
    >
      <div id='cm'>
        <div className='cm-top' ref={ cmTopRef }>
          <div className='item'></div>
          <div className='item'></div>
          <div className='item'></div>
        </div>
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
        {
          state.mode === 0 && (
            <div className='cm-panel-x'>
              <div className='cm-panel-input-group'>
                <input type='text' value={ '#' + state.hexValue.toUpperCase() } readOnly />
                <p>HEX</p>
              </div>
              <div className='cm-panel-input-group'>
                <input type='text' value={ Math.ceil(rgb.r) }
                  onChange={(e) => {
                    handleOnChange(e, 'r');
                  }}
                />
                <p>R</p>
              </div>
              <div className='cm-panel-input-group'>
                <input type='text' value={ Math.ceil(rgb.g) }
                  onChange={(e) => {
                    handleOnChange(e, 'g');
                  }}
                />
                <p>G</p>
              </div>
              <div className='cm-panel-input-group'>
                <input type='text' value={ Math.ceil(rgb.b) }
                  onChange={(e) => {
                    handleOnChange(e, 'b');
                  }}
                />
                <p>B</p>
              </div>
              <div
                className='cm-panel-mode-toggle-btn btn bounce'
                onClick={() => {
                  reducer({ type: 'mode', value: 1 });
                }}
              ></div>
            </div>
          )
        }
        {
          state.mode === 1 && (
            <div className='cm-panel-x'>
              <div className='cm-panel-input-group'>
                <input type='text' value={ '#' + state.hexValue.toUpperCase() } readOnly />
                <p>HEX</p>
              </div>
              <div className='cm-panel-input-group'>
                <input type='text' value={ Math.ceil(hsb.h) }
                  onChange={(e) => {
                    handleOnChange(e, 'h');
                  }}
                />
                <p>H</p>
              </div>
              <div className='cm-panel-input-group'>
                <input type='text' value={ Math.ceil(hsb.s) }
                  onChange={(e) => {
                    handleOnChange(e, 's');
                  }}
                />
                <p>S</p>
              </div>
              <div className='cm-panel-input-group'>
                <input type='text' value={ Math.ceil(hsb.b) }
                  onChange={(e) => {
                    handleOnChange(e, 'b');
                  }}
                />
                <p>B</p>
              </div>
              <div
                className='cm-panel-mode-toggle-btn btn bounce'
                onClick={() => {
                  reducer({ type: 'mode', value: 0 });
                }}
              ></div>
            </div>
          )
        }
        <div className='cm-history'
          style={{ display: state.historyArr.length > 0 ? '' : 'none' }}
        >
          {
            state.historyArr.map((item, index) => {
              let hex = '#' + RGBToHEX(item).toUpperCase();
              let tag = '';
              if (index === 0 || index === 8) {
                tag = 'tag-l';
              }
              if (index === 7 || index === 15) {
                tag = 'tag-r';
              }
              return (
                <div className='cm-history-item'
                  style={{ backgroundColor: hex }}
                  key={ index.toString() }
                >
                  <div className={ `popover popover-hidden ${ tag }`}>
                    <div className='popover-arrow'></div>
                    <div className='popover-inner'>{ hex }</div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

export default ColorMenu;
