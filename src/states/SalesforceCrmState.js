const ADD_SFDC_RECORD_TO_CACHE = 'ADD_SFDC_RECORD_TO_CACHE';
const MAX_SFDC_RECORDS = 100;

// Define plugin actions
export class Actions {
    static addRecord = (custRecord) => ({ type: ADD_SFDC_RECORD_TO_CACHE, custRecord });
    static getRecords = () => ({ type: GET_SFDC_RECORDS_IN_CACHE });
}

// Define how actions influence state
export function reduce(state = [], action) {
    switch (action.type) {
        case ADD_SFDC_RECORD_TO_CACHE: {
            if (!prevResultExists(state, action.custRecord.custPhone)) {
                return [
                    action.custRecord,
                    ...state.slice(0, MAX_SFDC_RECORDS - 1)
                ];
            }
        }
        default:
            return state;
    }
}

function prevResultExists(state, newPhone) {
    return state.some(function (element) {
        return element.custPhone === newPhone;
    });
}
