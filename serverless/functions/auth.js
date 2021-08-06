const jsforce = require('jsforce');

exports.handler = function (context, event, callback) {
  let response = new Twilio.Response();

  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const oauth2 = new jsforce.OAuth2({
    clientId: context.SFDC_CLIENT_ID,
    clientSecret: context.SFDC_CLIENT_SECRET,
    redirectUri: `https://${context.DOMAIN_NAME}/get-access-token`,
  })
  const authUrl = oauth2.getAuthorizationUrl({});
  console.log(authUrl);
  response.setStatusCode(301);
  response.appendHeader('Location', authUrl);
  return callback(null, response);
};