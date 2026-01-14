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
  const appId = import.meta.env.VITE_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
        <h1>Configuration Required</h1>
        <p>Please add <code>VITE_PRIVY_APP_ID</code> to your environment variables.</p>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={store}>
      <PrivyProvider
        appId={appId}
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
