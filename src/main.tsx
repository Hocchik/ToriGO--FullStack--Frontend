import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import './styles/tailwind.css';
import './styles/typografy.css'
import "./styles/notification.css";
import "mapbox-gl/dist/mapbox-gl.css";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);