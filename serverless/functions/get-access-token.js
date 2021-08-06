const jsforce = require('jsforce');

const refreshTokenPath = Runtime.getFunctions()['refresh-token'].path;
const refreshToken = require(refreshTokenPath);

exports.handler = async function (context, event, callback) {

  const twilioClient = context.getTwilioClient();

  let response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const oauth2 = new jsforce.OAuth2({
    clientId: context.SFDC_CLIENT_ID,
    clientSecret: context.SFDC_CLIENT_SECRET,
    redirectUri: `https://${context.DOMAIN_NAME}/get-access-token`,
  })

  const connection = new jsforce.Connection({ oauth2: oauth2 });

  // Exchange authorization code for access token & refresh token; check for valid SFDC Org. ID
  try {
    const userInfo = await connection.authorize(event.code);
    if (userInfo.organizationId !== context.SFDC_ORG_ID) {
      console.log('User from unauthorized org. ', userInfo.organizationId);
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    }
    console.log('User authorized from org. ', userInfo.organizationId);
    // Get user identity for access token
    const identityInfo = await connection.identity();
    await refreshToken.refreshToken(twilioClient, context, connection, response);
    response.setBody(`Successfully linked Flex to Salesforce for ${identityInfo.username}. Please close this window.`);
    return callback(null, response);
  } catch (err) {
    console.error(err);
    response.setBody('Authorization failed');
    response.setStatusCode(403);
    return callback(null, response);
  }

};