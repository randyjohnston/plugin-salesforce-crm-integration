const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const jsforce = require('jsforce');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
let refreshTokenPath = Runtime.getFunctions()['refresh-token'].path;
let refreshToken = require(refreshTokenPath);

exports.handler = TokenValidator(async function (context, event, callback) {
  const twilioClient = context.getTwilioClient();

  let response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

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

  let refreshedToken = false;
  connection.on("refresh", function (accessToken, res) {
    console.log('Refreshed new token: ', accessToken);
    refreshedToken = true;
  });

  const sfdcRecord = await sfdcQuery(event, connection, response, callback);

  if (refreshedToken) {
    await refreshToken.refreshToken(twilioClient, context, connection, response);
  }

  response.setBody(
    {
      'cust_name': sfdcRecord.Name,
      'cust_title': sfdcRecord.Title,
      'cust_acct_name': sfdcRecord.Account.Name,
      'cust_acct_type': sfdcRecord.Account.Type,
      'cust_acct_num': sfdcRecord.Account.AccountNumber,
      'cust_acct_sla': sfdcRecord.Account.SLA__c,
      'cust_acct_priority': sfdcRecord.Account.CustomerPriority__c,
    }
  );

  return callback(null, response);
});

const sfdcQuery = async (event, connection, response, callback) => {
  // convert E164 phone number into different formats for query
  const number = phoneUtil.parseAndKeepRawInput(event.phone, 'US');
  const nationalNumber = String(number.getNationalNumber());
  const formattedNationalNumber = phoneUtil.format(number, PNF.NATIONAL);
  const trimmedFormattedNationalNumber = formattedNationalNumber.replace(/\s/g, '');
  const formattedInternatinoalNumber = phoneUtil.format(number, PNF.INTERNATIONAL);
  const outOfCountryNumber = phoneUtil.formatOutOfCountryCallingNumber(number, 'US');
  const formattingNumberOptions = [
    event.phone,
    nationalNumber,
    formattedNationalNumber,
    trimmedFormattedNationalNumber,
    formattedInternatinoalNumber,
    outOfCountryNumber
  ];

  let sfdcRecord;
  await connection.sobject("Contact")
    .find(
      // conditions in JSON object
      { 'Phone': { $in: formattingNumberOptions } },
      // fields in JSON object
      {
        Name: 1,
        Title: 1,
        'Account.Name': 1,
        'Account.Type': 1,
        'Account.AccountNumber': 1,
        'Account.SLA__c': 1,
        'Account.CustomerPriority__c': 1
      }
    )
    .sort({ LastModifiedDate: -1 })
    .limit(1)
    .execute(function (err, records) {
      if (err) {
        response.setBody('Encountered query error');
        console.error(err);
        response.setStatusCode(400);
        return callback(null, response);
      } else if (records && records.length === 0) {
        response.setBody('Could not find SFDC record');
        console.error(err);
        response.setStatusCode(404);
        return callback(null, response);
      } else if (records) {
        console.log("Fetched: " + records.length);
        sfdcRecord = records[0];
      }
    });

  return sfdcRecord;

}