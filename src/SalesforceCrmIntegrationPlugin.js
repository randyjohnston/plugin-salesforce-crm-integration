import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import SalesforceCrm from './components/SalesforceCrm/SalesforceCrm'

import reducers, { namespace } from './states';

const PLUGIN_NAME = 'SalesforceCrmIntegrationPlugin';

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

    const options = { sortOrder: -1 };
    flex.AgentDesktopView.Panel2.Content.add(
      <SalesforceCrm key="salesforce" manager={manager} />,
      options
    );
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
