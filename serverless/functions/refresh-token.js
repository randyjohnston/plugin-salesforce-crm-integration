exports.refreshToken = async (twilioClient, context, connection, response) => {

    const identityInfo = await connection.identity(function (err, res) {
        if (err) {
            response.setBody('Authorization failed');
            response.setStatusCode(403);
            return callback(null, response);
        }
    });

    try {
        await twilioClient.sync
            .services(context.SYNC_SERVICE_SID)
            .syncMaps(context.SYNC_MAP_SID)
            .syncMapItems.create({
                key: identityInfo.username, data:
                {
                    'access_token': connection.accessToken,
                    'refresh_token': connection.refreshToken
                }
            });
    } catch (e) {
        console.error(e);
        if (e.status === 409 && e.code === 54208) {
            await twilioClient.sync
                .services(context.SYNC_SERVICE_SID)
                .syncMaps(context.SYNC_MAP_SID)
                .syncMapItems(identityInfo.username)
                .update({
                    data:
                    {
                        'access_token': connection.accessToken,
                        'refresh_token': connection.refreshToken
                    }
                });
        } else {
            response.setBody('Authorization failed');
            response.setStatusCode(403);
            return callback(null, response);
        }
    }

}