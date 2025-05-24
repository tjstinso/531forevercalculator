import { OAuth2Client } from 'google-auth-library';
import { TokenResponse } from '@react-oauth/google';

export const createOAuth2Client = (credentialResponse: TokenResponse) => {
    let _client = new OAuth2Client();
    _client.setCredentials({
        access_token: credentialResponse.access_token,
        scope: credentialResponse.scope,
        token_type: credentialResponse.token_type,
    });

    return _client;
}