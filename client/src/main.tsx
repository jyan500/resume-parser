import React from 'react';
import { PersistGate } from "redux-persist/integration/react";
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "./index.css"
import { Provider } from "react-redux"
import { persistor, store } from "./store"
import { TurnstileProvider } from "./contexts/TurnstileContext"

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// the change to render is necessary for the React WYSIWYG toolbar dropdowns to work
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TurnstileProvider>
          <App />
        </TurnstileProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);

