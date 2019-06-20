import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import '../style.css';

import getScreenSources from './desktop-capturer';

import { getCurrentScreen } from './utils/';

let currentScreen = getCurrentScreen();
// let scaleFactor = currentScreen.scaleFactor;
let screenWidth = currentScreen.bounds.width;
let screenHeight = currentScreen.bounds.height;

getScreenSources({}, (imgSrc: any) => {

  let bgImg = document.getElementById('bgImg');
  console.log('bgImg: ', bgImg);

  bgImg.style.backgroundImage = `url(${ imgSrc })`;
  bgImg.style.backgroundSize = `${ screenWidth }px ${ screenHeight }px`;
});



console.log(getScreenSources);
ReactDOM.render(
  <AppContainer>
    <div>
      SS
    </div>
  </AppContainer>,
  document.getElementById('app')
);


if (module.hot) {
  module.hot.accept();
}
