import React from 'react';
import { withTaskContext } from '@twilio/flex-ui';
import SalesforceCrm from './SalesforceCrm';

class SalesforceCrmContainer extends React.Component {

  constructor(props) {
    super(props);
    this.authUrl = `https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/auth`;
    this.loadingText = 'Loading...';
    this.state = {
      sfdcUserLoggedIn: false,
      sfdcUserName: undefined,
      matchingSfdcRecord: false,
      custRecord: {},
    };
    this.getCrmUser = this.getCrmUser.bind(this);
  }

  componentDidMount() {
    this.getCrmUser();
    if (this.props.task && this.props.task.attributes) {
      this.getCrmData();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.task !== prevProps.task
      && this.props.task
      && this.props.task.attributes
      && this.state.sfdcUserLoggedIn
    ) {
      this.getCrmData();
    }
  }

  // retrieve data using the Twilio function as a proxy
  getCrmUser() {
    this.setState({
      sfdcUserName: this.loadingText,
    });
    fetch(`https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/get-username`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        Token: this.props.manager.user.token
      })
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          // throw an error if we received any error from the Function
          console.error('CRM fetch failed, response:', response);
          throw new Error('Failed to fetch from CRM');
        }
      })
      .then((data) => {
        // save fetched user state in component's state
        this.setState({
          sfdcUserName: data.sfdc_username,
          sfdcUserLoggedIn: true
        });
      })
      .catch((error) => {
        // handle errors received from the Function or thrown during the fetch
        console.error('CRM request failed', error);
        this.setState({
          sfdcUserName: `No matching Salesforce authorization 
            (please login to Salesforce & refresh Flex)`,
          sfdcUserLoggedIn: false
        });
      });
  }

  getCrmData() {
    this.setState({
      matchingSfdcRecord: true,
      custRecord: {
        custName: this.loadingText,
        custRecordUrl: this.loadingText,
        custTitle: this.loadingText,
        custAcctName: this.loadingText,
        custAcctType: this.loadingText,
        custAcctNum: this.loadingText,
        custAcctSla: this.loadingText,
        custAcctPriority: this.loadingText
      }
    });
    fetch(`https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/get-contact-account-data`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        phone: this.props.task.attributes.name,
        Token: this.props.manager.user.token
      })
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          // throw an error if we received any error from the Function
          console.error('CRM fetch failed, response:', response);
          throw new Error('Failed to fetch from CRM');
        }
      })
      .then((data) => {
        // save fetched user state in component's state
        this.setState({
          matchingSfdcRecord: true,
          custRecord: {
            custName: data.cust_name,
            custRecordUrl: data.cust_record_url,
            custTitle: data.cust_title,
            custAcctName: data.cust_acct_name,
            custAcctType: data.cust_acct_type,
            custAcctNum: data.cust_acct_num,
            custAcctSla: data.cust_acct_sla,
            custAcctPriority: data.cust_acct_priority
          }
        });
      })
      .catch((error) => {
        // handle errors received from the Function or thrown during the fetch
        console.error('CRM request failed', error);
        this.setState({
          matchingSfdcRecord: false,
          custRecord: {
            custName: null,
            custTitle: null,
            custAcctName: null,
            custAcctType: null,
            custAcctNum: null,
            custAcctSla: null,
            custAcctPriority: null,
          }
        });
      });
  }

  render() {
    return <SalesforceCrm
      sfdcUserLoggedIn={this.state.sfdcUserLoggedIn}
      sfdcUserName={this.state.sfdcUserName}
      matchingSfdcRecord={this.state.matchingSfdcRecord}
      custRecord={this.state.custRecord}
      authUrl={this.authUrl}
      task={this.props.task}
    />
  }

}

export default withTaskContext(SalesforceCrmContainer);