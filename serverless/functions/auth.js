const jsforce = require('jsforce');

exports.handler = function (context, callback) {
  let response = new Twilio.Response();

  response.appendHeader('Access-Control-Allow-Origin', context.FLEX_INSTANCE_URL);
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const oauth2 = new jsforce.OAuth2({
    clientId: context.SFDC_CLIENT_ID,
    clientSecret: context.SFDC_CLIENT_SECRET,
    redirectUri: `${context.FLEX_INSTANCE_URL}/salesforce-oauth`
  })
  const authUrl = oauth2.getAuthorizationUrl({});
  console.log(`Auth endpoint called, redirecting user to ${authUrl}`);
  response.setStatusCode(301);
  response.appendHeader('Location', authUrl);
  return callback(null, response);
};