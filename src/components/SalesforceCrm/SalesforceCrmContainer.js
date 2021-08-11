import React from 'react';
import { withTaskContext } from '@twilio/flex-ui';
import SalesforceCrm from './SalesforceCrm';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions } from '../../states/SalesforceCrmState';

class SalesforceCrmContainer extends React.Component {

  constructor(props) {
    super(props);
    this.authUrl = `https://${process.env.REACT_APP_SERVERLESS_DOMAIN}/auth`;
    this.loadingText = 'Loading...';
    this.state = {
      sfdcUserLoggedIn: undefined,
      sfdcUserName: undefined,
      matchingSfdcRecord: false,
      custRecord: {},
    };
    this.getCrmUser = this.getCrmUser.bind(this);
    this.getCrmData = this.getCrmData.bind(this);
    this.setUserLoggingIn = this.setUserLoggingIn.bind(this);
    this.refreshSalesforceLogin = this.refreshSalesforceLogin.bind(this);
  }

  componentDidMount() {
    this.getCrmUser();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (this.props.task !== prevProps.task || this.state.sfdcUserLoggedIn != prevState.sfdcUserLoggedIn)
      && this.props.task?.attributes?.name
      && this.state.sfdcUserLoggedIn
    ) {
      this.getCrmData();
    }
  }

  getCrmUser(retries = 5, backoff = 500) {
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
        } else if (retries > 0 && (response.status === 429 || response.status >= 500)) {
          console.warn('CRM user fetch rate limited or server error');
          setTimeout(() => {
            return this.getCrmUser(retries - 1, backoff * 2);
          }, backoff);
        } else {
          console.error('CRM user fetch failed, response:', response);
          throw new Error('Failed to fetch user from CRM');
        }
      })
      .then((data) => {
        this.setState({
          sfdcUserName: data.sfdc_username,
          sfdcUserLoggedIn: true
        });
      })
      .catch((error) => {
        this.setState({
          sfdcUserName: `No Salesforce authorization 
            (please login to Salesforce below)`,
          sfdcUserLoggedIn: false
        });
      });
  }

  getCrmData(retries = 3, backoff = 750) {
    let foundCachedRecord;
    const cacheingEnabled = JSON.parse(
      process.env.REACT_APP_REDUX_SFDC_CACHEING_ENABLED.toLowerCase()
    );
    if (cacheingEnabled) {
      foundCachedRecord = this.props.sfdcRecords.find(
        sfdcRecord => sfdcRecord.custPhone === this.props.task.attributes.name
      );
    }
    if (cacheingEnabled && foundCachedRecord && foundCachedRecord.custName) {
      this.setState({
        matchingSfdcRecord: true,
        custRecord: foundCachedRecord
      })
    } else if (cacheingEnabled && foundCachedRecord && !foundCachedRecord.custName) {
      this.setState({
        matchingSfdcRecord: false,
        custRecord: foundCachedRecord
      })
    }
    else {
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
          country: this.props.task.attributes.caller_country,
          Token: this.props.manager.user.token
        })
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (retries > 0 && (response.status === 429 || response.status >= 500)) {
            console.warn('CRM contact fetch rate limited or server error');
            setTimeout(() => {
              return this.getCrmData(retries - 1, backoff * 2);
            }, backoff);
          } else {
            console.error('CRM contact fetch failed, response:', response);
            throw new Error('Failed to fetch contact from CRM');
          }
        })
        .then((data) => {
          this.setState({
            matchingSfdcRecord: true,
            custRecord: {
              custPhone: this.props.task.attributes.name,
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
          this.props.addRecord(this.state.custRecord);
        })
        .catch((error) => {
          this.setState({
            matchingSfdcRecord: false,
            custRecord: {
              custPhone: this.props.task.attributes.name,
              custName: null,
              custRecordUrl: null,
              custTitle: null,
              custAcctName: null,
              custAcctType: null,
              custAcctNum: null,
              custAcctSla: null,
              custAcctPriority: null
            }
          });
          this.props.addRecord(this.state.custRecord);
        });
    }
  }

  setUserLoggingIn() {
    this.setState({
      sfdcUserLoggedIn: undefined
    });
  }

  refreshSalesforceLogin() {
    this.getCrmUser();
  }

  render() {
    return <SalesforceCrm
      sfdcUserLoggedIn={this.state.sfdcUserLoggedIn}
      setUserLoggingIn={this.setUserLoggingIn}
      refreshSalesforceLogin={this.refreshSalesforceLogin}
      sfdcUserName={this.state.sfdcUserName}
      matchingSfdcRecord={this.state.matchingSfdcRecord}
      custRecord={this.state.custRecord}
      authUrl={this.authUrl}
      task={this.props.task}
      loadingText={this.loadingText}
    />
  }

}

// Define mapping functions
const mapStateToProps = (state) => ({
  sfdcRecords: state['salesforce-crm-salesforce-integration'].sfdcRecords,
});

const mapDispatchToProps = (dispatch) => ({
  addRecord: bindActionCreators(Actions.addRecord, dispatch),
});

// Connect presentational component to Redux
export default connect(mapStateToProps, mapDispatchToProps)(withTaskContext(SalesforceCrmContainer));