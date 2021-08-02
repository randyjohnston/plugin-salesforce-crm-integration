import React from 'react';
import {
  CustomCRMContainer,
  ProfileCanvas,
  ProfileGrid,
  Label,
  Value,
  Header,
  HeaderLine
} from './SalesforceCrm.Styles';

class SalesforceCrm extends React.Component {

  render() {
    const { task } = this.props;
    return (
      <CustomCRMContainer>
        <ProfileCanvas>
          <Header>Customer Salesforce data</Header>
          <HeaderLine>Logged into Salesforce as {this.props.sfdcUserName
            ? this.props.sfdcUserName
            : 'Unknown SFDC username'
          }
          </HeaderLine>
          {task
            && task.attributes
            && task.attributes.name
            && this.props.matchingSfdcRecord
            && this.props.sfdcUserLoggedIn
            && this.props.custRecord.custName
            &&
            <>
              <Label>
                <a
                  href={this.props.custRecord.custRecordUrl}
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
                  <Value>{this.props.custRecord.custName}</Value>
                </div>
                <div>
                  <Label>Customer Title</Label>
                  <Value>{this.props.custRecord.custTitle}</Value>
                </div>
                <div>
                  <Label>Customer Account Name</Label>
                  <Value>{this.props.custRecord.custAcctName}</Value>
                </div>
                <div>
                  <Label>Customer Account Type</Label>
                  <Value>{this.props.custRecord.custAcctType}</Value>
                </div>
                <div>
                  <Label>Customer Account Number</Label>
                  <Value>{this.props.custRecord.custAcctNum}</Value>
                </div>
                <div>
                  <Label>Customer Account SLA</Label>
                  <Value>{this.props.custRecord.custAcctSla}</Value>
                </div>
                <div>
                  <Label>Customer Account Priority</Label>
                  <Value>{this.props.custRecord.custAcctPriority}</Value>
                </div>
              </ProfileGrid>
            </>
          }
          {!this.props.matchingSfdcRecord
            &&
            <Label>No matching SFDC contacts</Label>
          }
          {!this.props.sfdcUserLoggedIn &&
            <Label>
              <a
                href={this.props.authUrl}
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

export default SalesforceCrm;