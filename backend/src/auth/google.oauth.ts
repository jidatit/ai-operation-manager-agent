import { google } from 'googleapis';
import { env } from '../config/env.js';

const LOGIN_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export function createGoogleOAuthClient(redirectUri?: string) {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    redirectUri ?? env.GOOGLE_REDIRECT_URI,
  );
}

export function getGoogleLoginUrl(): string {
  const client = createGoogleOAuthClient(env.GOOGLE_REDIRECT_URI);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: LOGIN_SCOPES,
    include_granted_scopes: true,
  });
}

export function getGoogleConnectUrl(state: string): string {
  const client = createGoogleOAuthClient(env.GOOGLE_CONNECT_REDIRECT_URI);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: LOGIN_SCOPES,
    include_granted_scopes: true,
    state,
  });
}

export { LOGIN_SCOPES };
