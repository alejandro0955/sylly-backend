import React from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App'
import './styles/global.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

if (!domain || !clientId) {
  console.error('Missing Auth0 configuration. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID.')
}

const authorizationParams = {
  redirect_uri: window.location.origin,
  scope: 'openid profile email offline_access',
}
if (audience) {
  authorizationParams.audience = audience
}

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={domain || ''}
    clientId={clientId || ''}
    authorizationParams={authorizationParams}
    useRefreshTokens={true}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>
)