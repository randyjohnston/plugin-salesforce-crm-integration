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
  const userInfo = await connection.authorize(event.code, function (err, userInfo) {
    if (err) {
      console.log('User unauthorized or OAuth error');
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    } else if (userInfo.organizationId !== context.SFDC_ORG_ID) {
      console.log('User from unauthorized org. ', userInfo.organizationId);
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    }
    console.log('User authorized from org. ', userInfo.organizationId);
  });

  // Get user identity for access token
  const identityInfo = await connection.identity(function (err, res) {
    if (err) {
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    }
  });

  await refreshToken.refreshToken(twilioClient, context, connection, response);

  response.setBody(`Successfully linked Flex to Salesforce for ${identityInfo.username}.`);
  return callback(null, response);

};