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
    const foundCachedRecord = this.props.sfdcRecords.find(
      sfdcRecord => sfdcRecord.custPhone === this.props.task.attributes.name);
    if (foundCachedRecord && foundCachedRecord.custName) {
      this.setState({
        matchingSfdcRecord: true,
        custRecord: foundCachedRecord
      })
    } else if (foundCachedRecord && !foundCachedRecord.custName) {
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
          // handle errors received from the Function or thrown during the fetch
          console.error('CRM request failed', error);
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

// Define mapping functions
const mapStateToProps = (state) => ({
  sfdcRecords: state['salesforce-crm-salesforce-integration'].sfdcRecords,
});

const mapDispatchToProps = (dispatch) => ({
  addRecord: bindActionCreators(Actions.addRecord, dispatch),
});

// Connect presentational component to Redux
export default connect(mapStateToProps, mapDispatchToProps)(withTaskContext(SalesforceCrmContainer));
