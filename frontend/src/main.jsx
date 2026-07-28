// Entry point of the app: mounts React onto the HTML page
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

// Lets redux-persist save/restore the Redux store (e.g. logged-in user) across page reloads
const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Makes the Redux store available to every component in the app */}
    <Provider store={store}>
      {/* Waits until saved state is loaded back from storage before showing the app */}
      <PersistGate loading={null} persistor={persistor}>
        <App />
        {/* Shows little popup notifications (toasts) anywhere in the app */}
        <Toaster />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
