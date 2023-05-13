// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '2eybkkq9sa'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'phiquocdung-dev.us.auth0.com',            // Auth0 domain
  clientId: 'j5mOey9tDJ08X9WKrZTnc4XgX4xnoWE8',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
