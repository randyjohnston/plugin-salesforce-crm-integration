import React from 'react'
import OauthPopup from 'react-oauth-popup';
import { Button } from './OauthLogin.Styles';

export default class OauthLogin extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authCode: undefined,
        };
    }

    componentDidUpdate(prevState) {
        if (
            (this.state.authCode) && (typeof prevState.authCode == 'undefined')
        ) {
            this.exchangeAuthCode(this.state.authCode);
        }
    }

    onCode = (code) => {
        this.setState({
            authCode: code
        });
    }

    exchangeAuthCode(code, retries = 5, backoff = 500) {
        fetch(`https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/get-access-token`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                Token: this.props.manager.user.token,
                code: code
            })
        })
            .then((response) => {
                if (response.ok) {
                    this.setState({
                        authCode: undefined
                    });
                    this.props.refreshSalesforceLogin();
                    return response.json();
                } else if (retries > 0 && (response.status === 429 || response.status >= 500)) {
                    console.warn('CRM auth code exchange fetch rate limited or server error');
                    setTimeout(() => {
                        return this.exchangeAuthCode(retries - 1, backoff * 2);
                    }, backoff);
                } else {
                    console.error('CRM auth code exchange fetch failed, response:', response);
                    throw new Error('Failed to fetch access token from CRM');
                }
            });
    }

    render() {
        return (
            <OauthPopup
                url={this.props.url}
                onCode={this.onCode}
                onClose={() => { }}
            >
                <Button>{this.props.children}</Button>
            </OauthPopup>
        );
    }

}
