import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';

import '../public/css/style.css';


ReactDOM.render(
  <AppContainer>
    <div>
      <App />
    </div>
  </AppContainer>,
  document.getElementById('app')
);


if (module.hot) {
  module.hot.accept();
}
