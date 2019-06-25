import * as React from 'react';


interface BindMoveConfig {
  el: any;
  flag?: Boolean;
  handleMove: any;
}

const bindMove = (config: BindMoveConfig) => {
  const { el, handleMove } = config;
  el.addEventListener('mousedown', (e: MouseEvent) => {

    document.addEventListener('mousemove', handleMove);

    const mouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mouseup', mouseUp);
  });
};

const ColorMenu = () => {
  const cmWrapRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const [state, setState] = React.useState({
    top: '20px',
    left: '20px'
  });

  const handlePickerBtnMove = (e: MouseEvent) => {
    const panel = panelRef.current;
    let w = panel.offsetWidth;
    let h = panel.offsetHeight;

    let t = e.pageY - cmWrapRef.current.offsetTop - panelRef.current.offsetTop;
    let l = e.pageX - cmWrapRef.current.offsetLeft - panelRef.current.offsetLeft;

    t = t > h ? h : t;
    t = t < 0 ? 0 : t;

    l = l > w ? w : l;
    l = l < 0 ? 0 : l;

    setState({
      top: t + 'px',
      left: l + 'px'
    });
  };

  React.useEffect(() => {
    bindMove({
      el: panelRef.current,
      handleMove: handlePickerBtnMove,
    })
  }, []);

  return (
    <div id='cm-wrap' ref={ cmWrapRef }>
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
      </div>

    </div>
  );
}

export default ColorMenu;
