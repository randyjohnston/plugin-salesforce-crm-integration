import { combineReducers } from 'redux';
import { reduce } from './SalesforceCrmState';

// Register your redux store under a unique namespace
export const namespace = 'salesforce-crm-salesforce-integration';

// Combine the reducers
export default combineReducers(
    {
        sfdcRecords: reduce
    }
);
