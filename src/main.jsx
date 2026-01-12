import React, { createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { useStore } from './store/store';

const StoreContext = createContext();

export const useAppStore = () => useContext(StoreContext);

const Root = () => {
  const store = useStore();
  return (
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
