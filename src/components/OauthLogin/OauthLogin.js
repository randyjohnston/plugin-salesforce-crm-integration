/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import OauthPopup from 'react-oauth-popup';

import { Button } from './OauthLogin.Styles';

export default function OauthLogin(props) {
  const [authCode, setAuthCode] = useState();

  const exchangeAuthCode = (code, retries = 5, backoff = 500) => {
    fetch(`https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/get-access-token`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        Token: props.manager.user.token,
        code,
      }),
      // eslint-disable-next-line consistent-return
    }).then((response) => {
      if (response.ok) {
        props.refreshSalesforceLogin();
        return response.json();
      } else if (retries > 0 && (response.status === 429 || response.status >= 500)) {
        console.warn('CRM auth code exchange fetch rate limited or server error');
        setTimeout(() => {
          return exchangeAuthCode(retries - 1, backoff * 2);
        }, backoff);
      } else {
        console.error('CRM auth code exchange fetch failed, response:', response);
        throw new Error('Failed to fetch access token from CRM');
      }
    });
  };

  const onCode = (code) => {
    setAuthCode(code);
  };

  useEffect(() => {
    if (authCode) {
      exchangeAuthCode(authCode);
    }
  }, [authCode]);

  return (
    // eslint-disable-next-line no-empty-function
    <OauthPopup url={props.url} onCode={onCode} onClose={() => {}}>
      <Button>{props.children}</Button>
    </OauthPopup>
  );
}
