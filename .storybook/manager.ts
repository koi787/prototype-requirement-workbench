import { addons } from 'storybook/manager-api';
import { PANEL_ID } from '../src/prototype-core/requirement-panel/addon/constants';
import '../src/prototype-core/requirement-panel/addon/register';

addons.setConfig({
  selectedPanel: PANEL_ID,
  layout: {
    panelPosition: 'right',
    rightPanelWidth: 420,
  },
});

