import * as React from 'react';
import { ColorCovert } from 'Utils';

let hsb = {
  h: 0,
  s: 0,
  b: 0
};

let rgb = {
  r: 0,
  g: 0,
  b: 0
};


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

  let w: number = 0;
  let h: number = 0;
  let rect: (ClientRect | DOMRect | null) = null;

  const [state, setState] = React.useState({
    top: '20px',
    left: '20px',
    hexValue: '#ffffff'
  });

  const handlePickerBtnMove = (e: MouseEvent) => {
    let t: number = e.pageY - rect.top;
    let l: number = e.pageX - rect.left;

    t = t > h ? h : t;
    t = t < 0 ? 0 : t;

    l = l > w ? w : l;
    l = l < 0 ? 0 : l;



    setState({
      top: t + 'px',
      left: l + 'px',
      hexValue: ''
    });
  };

  React.useEffect(() => {
    bindMove({
      el: panelRef.current,
      handleMove: handlePickerBtnMove,
    });

    const panel = panelRef.current;
    w = panel.offsetWidth;
    h = panel.offsetHeight;

    // it would change every time the scrolling position changes, but we can use it here
    rect = panel.getBoundingClientRect();
  }, []);

  return (
    <div id='cm-wrap'>
      <div id='cm'>
        <div className='cm-top'></div>
        <div className='cm-panel-wrap'>
          <div className='cm-panel' ref={ panelRef }>
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
        <div className='cm-panel-bar'></div>
        <div className='cm-panel-x'></div>
      </div>

    </div>
  );
}

export default ColorMenu;
