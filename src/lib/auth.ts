import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { TokenResponse } from '@react-oauth/google';


let client: OAuth2Client | undefined;

export const createOAuth2Client = (credentialResponse: TokenResponse) => {
    if (client != undefined) return client;

    let _client = new OAuth2Client();
    _client.setCredentials({
        access_token: credentialResponse.access_token,
        scope: credentialResponse.scope,
        token_type: credentialResponse.token_type,
    });

    return _client;
}

export const getSheets = () => {
    // let sheet = google.sheets({ version: 'v4', auth: client })
    // console.log(sheet.spreadsheets.sheets)
} 


const getDrive = (credentialResponse: TokenResponse)  => {
    // return google.drive();
} 

