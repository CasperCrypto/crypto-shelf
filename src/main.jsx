import React, { createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App.jsx';
import './index.css';
import { useStore } from './store/store';

const StoreContext = createContext();

export const useAppStore = () => useContext(StoreContext);

const Root = () => {
  const store = useStore();
  return (
    <StoreContext.Provider value={store}>
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID || ""}
        config={{
          loginMethods: ['email', 'wallet', 'google', 'twitter'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
          },
        }}
      >
        <App />
      </PrivyProvider>
    </StoreContext.Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
