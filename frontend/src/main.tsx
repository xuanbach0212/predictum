import { PrivyProvider } from '@privy-io/react-auth'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || 'clpispdty00ycl80fpueukbhl'}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#2563eb',
        },
        loginMethods: ['email', 'wallet', 'google'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
