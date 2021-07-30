import React from 'react';
import { withTheme, withTaskContext } from '@twilio/flex-ui';
import { Label, Value, Header, HeaderLine } from './Common.Styles';
import {
  CustomCRMContainer,
  ProfileCanvas,
  ProfileGrid,
  LargeCaption
} from './SalesforceCrm.Styles';

class SalesforceCrm extends React.Component {

  constructor(props) {
    super(props);
    this.authUrl = `https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/auth`;
    this.loadingText = 'Loading...';
    this.state = {
      sfdcUserName: undefined,
      matchingSfdcRecord: undefined,
      custName: undefined,
      custRecordUrl: undefined,
      custTitle: undefined,
      custAcctName: undefined,
      custAcctType: undefined,
      custAcctNum: undefined,
      custAcctSla: undefined,
      custAcctPriority: undefined,
      sfdcUserLoggedIn: undefined
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
      custName: this.loadingText,
      custRecordUrl: this.loadingText,
      custTitle: this.loadingText,
      custAcctName: this.loadingText,
      custAcctType: this.loadingText,
      custAcctNum: this.loadingText,
      custAcctSla: this.loadingText,
      custAcctPriority: this.loadingText,
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
          custName: data.cust_name,
          custRecordUrl: data.cust_record_url,
          custTitle: data.cust_title,
          custAcctName: data.cust_acct_name,
          custAcctType: data.cust_acct_type,
          custAcctNum: data.cust_acct_num,
          custAcctSla: data.cust_acct_sla,
          custAcctPriority: data.cust_acct_priority,
        });
      })
      .catch((error) => {
        // handle errors received from the Function or thrown during the fetch
        console.error('CRM request failed', error);
        this.setState({
          matchingSfdcRecord: false,
          custName: null,
          custTitle: null,
          custAcctName: null,
          custAcctType: null,
          custAcctNum: null,
          custAcctSla: null,
          custAcctPriority: null,
        });
      });
  }

  render() {
    const { task } = this.props;
    return (
      <CustomCRMContainer>
        <ProfileCanvas>
          <Header>Customer Salesforce data</Header>
          <HeaderLine>Logged into Salesforce as {this.state.sfdcUserName
            ? this.state.sfdcUserName
            : 'Unknown SFDC username'
          }
          </HeaderLine>
          {task
            && task.attributes
            && task.attributes.name
            && this.state.matchingSfdcRecord
            && this.state.sfdcUserLoggedIn
            &&
            <>
              <Label>
                <a
                  href={this.state.custRecordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Salesforce Contact Record
                </a>
              </Label>
              <ProfileGrid>
                <div>
                  <Label>Customer Phone Number</Label>
                  <Value>{task.attributes.name}</Value>
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Value>{this.state.custName}</Value>
                </div>
                <div>
                  <Label>Customer Title</Label>
                  <Value>{this.state.custTitle}</Value>
                </div>
                <div>
                  <Label>Customer Account Name</Label>
                  <Value>{this.state.custAcctName}</Value>
                </div>
                <div>
                  <Label>Customer Account Type</Label>
                  <Value>{this.state.custAcctType}</Value>
                </div>
                <div>
                  <Label>Customer Account Number</Label>
                  <Value>{this.state.custAcctNum}</Value>
                </div>
                <div>
                  <Label>Customer Account SLA</Label>
                  <Value>{this.state.custAcctSla}</Value>
                </div>
                <div>
                  <Label>Customer Account Priority</Label>
                  <Value>{this.state.custAcctPriority}</Value>
                </div>
              </ProfileGrid>
            </>
          }
          {!this.state.matchingSfdcRecord
            &&
            <Label>No matching SFDC contacts</Label>
          }
          {!this.state.sfdcUserLoggedIn &&
            <Label>
              <a
                href={this.authUrl}
                target="_blank"
                rel="noopener noreferrer"
              >Click here to login
              </a>
            </Label>
          }
        </ProfileCanvas>
      </CustomCRMContainer>
    );
  }

}

export default withTheme(withTaskContext(SalesforceCrm));