const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const jsforce = require('jsforce');

exports.handler = TokenValidator(async function (context, event, callback) {

  const twilioClient = context.getTwilioClient();

  let response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
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
  response.setBody({ 'sfdc_username': identityInfo.username });
  return callback(null, response);

});

const oauthHelper = async (event, context, twilioClient) => {
  const syncMapItem = await twilioClient.sync.services(context.SYNC_SERVICE_SID)
    .syncMaps(context.SYNC_MAP_SID)
    .syncMapItems(event.TokenResult.realm_user_id)
    .fetch();

  const oauth2 = new jsforce.OAuth2({
    clientId: context.SFDC_CLIENT_ID,
    clientSecret: context.SFDC_CLIENT_SECRET,
    redirectUri: `https://${context.DOMAIN_NAME}/get-access-token`,
  });

  const connection = new jsforce.Connection(
    {
      oauth2: oauth2,
      instanceUrl: context.SFDC_INSTANCE_URL,
      accessToken: syncMapItem.data.access_token,
      refreshToken: syncMapItem.data.refresh_token
    }
  );

  return connection;
}
