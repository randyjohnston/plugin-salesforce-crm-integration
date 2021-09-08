/* eslint-disable func-names */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const jsforce = require('jsforce');

exports.handler = TokenValidator(async function (context, event, callback) {
  const twilioClient = context.getTwilioClient();

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', context.FLEX_INSTANCE_URL);
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('Querying Sync & SFDC for Flex User: ', JSON.stringify(event.TokenResult));

  const connection = await oauthHelper(event, context, twilioClient);

  const identityInfo = await connection.identity(function (err, res) {
    if (err) {
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    }
  });

  console.log(`Retrieved SFDC identity ${identityInfo.username} 
    for Flex user ${event.TokenResult.realm_user_id}`);
  response.setBody({ sfdc_username: identityInfo.username });
  return callback(null, response);
});

const oauthHelper = async (event, context, twilioClient) => {
  const syncDoc = await twilioClient.sync
    .services(context.SYNC_SERVICE_SID)
    .documents(event.TokenResult.realm_user_id)
    .fetch();

  const oauth2 = new jsforce.OAuth2({
    clientId: context.SFDC_CLIENT_ID,
    clientSecret: context.SFDC_CLIENT_SECRET,
    redirectUri: `${context.FLEX_INSTANCE_URL}/salesforce-oauth`,
  });

  return new jsforce.Connection({
    oauth2,
    instanceUrl: context.SFDC_INSTANCE_URL,
    accessToken: syncDoc.data.access_token,
    refreshToken: syncDoc.data.refresh_token,
  });
};
