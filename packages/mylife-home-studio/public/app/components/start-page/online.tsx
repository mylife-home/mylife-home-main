import React, { FunctionComponent } from 'react';

import { Container, Section, ItemLink } from './layout';
import { useActions } from '../lib/use-actions';
import { CoreDesignerNewTabData } from '../../store/core-designer/types';
import {
  newCoreDesignerTab,
  newUiDesignerTab,
  newOnlineComponentsViewTab,
  newOnlineHistoryTab,
  newOnlineInstancesViewTab,
  newOnlineLogsTab,
  newDeployTab,
} from '../../store/tabs/actions';

import * as schema from '../../files/schema';

let counter = 0;

const Online: FunctionComponent = () => {
  const {
    newCoreDesignerTab,
    newUiDesignerTab,
    newOnlineComponentsViewTab: newOnlineComponentsView,
    newOnlineHistoryTab: newOnlineHistory,
    newOnlineInstancesViewTab: newOnlineInstancesView,
    newOnlineLogsTab: newOnlineLogs,
    newDeployTab: newDeploy,
  } = useConnect();

  const newCoreDesigner = () => {
    const data: CoreDesignerNewTabData = schema.vpanelCore;
    newCoreDesignerTab({ title: `Core designer ${++counter}`, data });
  };

  const newUiDesigner = () => {
    newUiDesignerTab({ title: `UI designer ${++counter}`, data: null });
  };

  return (
    <Container>
      <Section title="Temp" />

      <ItemLink text="Nouveau designer core" onClick={newCoreDesigner} />
      <ItemLink text="Nouveau designer UI" onClick={newUiDesigner} />

      <Section title="En ligne" />

      <ItemLink text="Logs" onClick={newOnlineLogs} />
      <ItemLink text="Historique" onClick={newOnlineHistory} />
      <ItemLink text="Vue des instances" onClick={newOnlineInstancesView} />
      <ItemLink text="Vue des composants" onClick={newOnlineComponentsView} />
      <ItemLink text="Déploiement" onClick={newDeploy} />

    </Container>
  );
};

export default Online;

function useConnect() {
  return useActions({
    newCoreDesignerTab,
    newUiDesignerTab,
    newOnlineComponentsViewTab,
    newOnlineHistoryTab,
    newOnlineInstancesViewTab,
    newOnlineLogsTab,
    newDeployTab,
  });
}
