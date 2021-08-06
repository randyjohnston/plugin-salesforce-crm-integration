import React from 'react'
import { Button } from './OauthLoginButton.Styles';

export default class OauthLoginButton extends React.Component {

    constructor(props) {
        super(props);
        this.createPopup = this.createPopup.bind(this);
    }

    createPopup() {
        const { url, title, width, height, onClose } = this.props;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        const windowFeatures = `toolbar=0,scrollbars=1,status=1,resizable=0,location=1,menuBar=0,width=${width},height=${height},top=${top},left=${left}`;

        const externalWindow = window.open(
            url,
            title,
            windowFeatures
        );

        const timer = setInterval(function () {
            if (externalWindow.closed) {
                clearInterval(timer);
                onClose();
            }
        }, 500);
    };

    render() {
        return (
            <Button onClick={this.createPopup}>
                {this.props.children}
            </Button>
        );
    }

}