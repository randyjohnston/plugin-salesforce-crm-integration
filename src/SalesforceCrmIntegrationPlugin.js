/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import SalesforceCrmContainer from './components/SalesforceCrm/SalesforceCrmContainer';
import reducers, { namespace } from './states';

const PLUGIN_NAME = 'SalesforceCrmIntegrationPlugin';

// eslint-disable-next-line import/no-unused-modules
export default class SalesforceCrmIntegrationPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);

    flex.AgentDesktopView.Panel2.Content.remove('container');

    flex.AgentDesktopView.Panel2.Content.add(<SalesforceCrmContainer key="salesforce" manager={manager} />);

    flex.ViewCollection.Content.add(<flex.View name="salesforce-oauth" key="salesforce-oauth" />);
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
