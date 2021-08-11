const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const jsforce = require('jsforce');

const refreshTokenPath = Runtime.getFunctions()['refresh-token'].path;
const refreshToken = require(refreshTokenPath).refreshToken;

exports.handler = TokenValidator(async function (context, event, callback) {

  const twilioClient = context.getTwilioClient();

  let response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', context.FLEX_INSTANCE_URL);
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const oauth2 = new jsforce.OAuth2({
    clientId: context.SFDC_CLIENT_ID,
    clientSecret: context.SFDC_CLIENT_SECRET,
    redirectUri: `${context.FLEX_INSTANCE_URL}/salesforce-oauth`
  })

  const connection = new jsforce.Connection({ oauth2: oauth2 });

  // Exchange authorization code for access token & refresh token; check for valid SFDC Org. ID
  try {
    const userInfo = await connection.authorize(event.code);
    if (userInfo.organizationId === context.SFDC_ORG_ID) {
      console.log('User authorized from org. ', userInfo.organizationId);
    } else {
      console.error('User from unauthorized org. ', userInfo.organizationId);
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    }
    // Get user identity for SF access token - check that Flex and SF users match
    const identityInfo = await refreshToken(twilioClient, context, connection, response);
    if (identityInfo.username === event.TokenResult.realm_user_id) {
      console.log(
        `Salesforce login ${identityInfo.username} matches Flex login ${event.TokenResult.realm_user_id}`
      );
      response.setBody(`Successfully linked Flex to Salesforce for ${identityInfo.username}.`);
      return callback(null, response);
    } else {
      console.error(
        `Flex user ${event.TokenResult.realm_user_id} logged into SFDC as ${identityInfo.username}`
      );
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    }
  } catch (err) {
    console.error(err);
    response.setBody('Authorization failed');
    response.setStatusCode(403);
    return callback(null, response);
  }

});