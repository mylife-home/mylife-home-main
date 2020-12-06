import React, { FunctionComponent } from 'react';

import { Container, Section, ItemLink } from './layout';
import { useAction } from '../lib/use-actions';
import {
  newOnlineComponentsViewTab,
  newOnlineHistoryTab,
  newOnlineInstancesViewTab,
  newOnlineLogsTab,
  newDeployTab,
} from '../../store/tabs/actions';

const Online: FunctionComponent<{ className?: string }> = ({ className }) => {
  const newOnlineComponentsView = useAction(newOnlineComponentsViewTab);
  const newOnlineHistory = useAction(newOnlineHistoryTab);
  const newOnlineInstancesView = useAction(newOnlineInstancesViewTab);
  const newOnlineLogs = useAction(newOnlineLogsTab);
  const newDeploy = useAction(newDeployTab);

  return (
    <Container className={className}>
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
