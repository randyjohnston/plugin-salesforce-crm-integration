const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const jsforce = require('jsforce');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
let refreshTokenPath = Runtime.getFunctions()['refresh-token'].path;
let refreshToken = require(refreshTokenPath).refreshToken;

exports.handler = TokenValidator(async function (context, event, callback) {
  const twilioClient = context.getTwilioClient();

  let response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', context.FLEX_INSTANCE_URL);
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const connection = await oauthHelper(event, context, twilioClient);
  
  let refreshedToken = false;
  connection.on("refresh", () => {
    refreshedToken = true;
  });

  const identityInfo = await validateSalesforceFlexIdentitiesMatch(connection, event);
  const sfdcRecords = await sfdcQuery(event, connection, response, callback);

  if (refreshedToken) {
    await refreshToken(twilioClient, context, connection, identityInfo, response);
  }

  if (sfdcRecords.length !== 1) {
    response.setBody('Could not find SFDC record');
    response.setStatusCode(404);
    return callback(null, response);
  }
  const sfdcRecord = sfdcRecords[0];

  response.setBody(
    {
      'cust_name': sfdcRecord.Name,
      'cust_record_url':
        `${process.env.SFDC_INSTANCE_URL}/lightning/r/Contact/${sfdcRecord.Id}/view`,
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

const oauthHelper = async (event, context, twilioClient) => {
  const syncDoc = await twilioClient.sync.services(context.SYNC_SERVICE_SID)
    .documents(event.TokenResult.realm_user_id)
    .fetch();

  const oauth2 = new jsforce.OAuth2({
    clientId: context.SFDC_CLIENT_ID,
    clientSecret: context.SFDC_CLIENT_SECRET,
    redirectUri: `${context.FLEX_INSTANCE_URL}/salesforce-oauth`
  });

  const connection = new jsforce.Connection(
    {
      oauth2: oauth2,
      instanceUrl: context.SFDC_INSTANCE_URL,
      accessToken: syncDoc.data.access_token,
      refreshToken: syncDoc.data.refresh_token
    }
  );
  console.log(`Established SFDC query connection for ${event.TokenResult.realm_user_id}`);

  return connection;
}

const validateSalesforceFlexIdentitiesMatch = async (connection, event) => {
  const identityInfo = await connection.identity();
  if (identityInfo.username === event.TokenResult.realm_user_id) {
    console.log(
      `Salesforce login ${identityInfo.username} matches Flex login ${event.TokenResult.realm_user_id}`
    );
    return identityInfo;
  } else {
    console.error(
      `Flex user ${event.TokenResult.realm_user_id} logged into SFDC as ${identityInfo.username}`
    );
    response.setBody('Authorization failed');
    response.setStatusCode(403);
    return callback(null, response);
  }
}

const sfdcQuery = async (event, connection, response, callback) => {
  // convert E164 phone number into different formats for query
  const number = phoneUtil.parseAndKeepRawInput(event.phone, event.country);
  const nationalNumber = String(number.getNationalNumber());
  const formattedNationalNumber = phoneUtil.format(number, PNF.NATIONAL);
  const trimmedFormattedNationalNumber = formattedNationalNumber.replace(/\s/g, '');
  const formattedInternatinoalNumber = phoneUtil.format(number, PNF.INTERNATIONAL);
  const outOfCountryNumber = phoneUtil.formatOutOfCountryCallingNumber(number, event.country);
  const formattingNumberOptions = [
    event.phone,
    nationalNumber,
    formattedNationalNumber,
    trimmedFormattedNationalNumber,
    formattedInternatinoalNumber,
    outOfCountryNumber
  ];

  try {
    const sfdcRecords = await connection.sobject("Contact")
      .find(
        {
          $or:
            [
              {
                'Phone':
                {
                  $in: formattingNumberOptions
                }
              },
              {
                'MobilePhone':
                {
                  $in: formattingNumberOptions
                }
              },
            ]
        },
        {
          Id: 1,
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
      .execute();
    console.log("Fetched # SFDC records: " + sfdcRecords.length);
    return sfdcRecords;
  } catch (err) {
    response.setBody('Encountered query error');
    console.error(err);
    response.setStatusCode(400);
    return callback(null, response);
  }
}