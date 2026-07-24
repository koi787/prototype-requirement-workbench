import React from 'react';
void React;

import { AddonPanel } from 'storybook/internal/components';
import { addons, types } from 'storybook/manager-api';
import { RequirementPanelShell } from './RequirementPanelShell';
import { ADDON_ID, PANEL_ID } from './constants';

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: '需求说明',
    render: ({ active }) => (
      <AddonPanel active={active ?? false}>
        <RequirementPanelShell />
      </AddonPanel>
    ),
  });
});

