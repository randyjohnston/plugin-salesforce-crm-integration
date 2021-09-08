/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
exports.refreshToken = async (twilioClient, context, connection, identityInfo, response) => {
  try {
    const createdDocument = await twilioClient.sync.services(context.SYNC_SERVICE_SID).documents.create({
      uniqueName: identityInfo.username,
      data: {
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
      },
    });
    console.log(
      `Created initial tokens for ${identityInfo.username} 
            in Doc SID ${createdDocument.sid}`,
    );
  } catch (e) {
    console.error(e);
    if (e.status === 409 && e.code === 54301) {
      const updatedDocument = await twilioClient.sync
        .services(context.SYNC_SERVICE_SID)
        .documents(identityInfo.username)
        .update({
          data: {
            access_token: connection.accessToken,
            refresh_token: connection.refreshToken,
          },
        });
      console.log(
        `Updated tokens for ${identityInfo.username} 
                in Doc SID ${updatedDocument.sid}`,
      );
    } else {
      response.setBody('Authorization failed');
      response.setStatusCode(403);
      return callback(null, response);
    }
  }
};
