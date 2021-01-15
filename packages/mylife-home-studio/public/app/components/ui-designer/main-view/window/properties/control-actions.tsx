import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { UiControl } from '../../../../../store/ui-designer/types';
import { Action, ActionComponent, ActionWindow } from '../../../../../../../shared/ui-model';
import { Group, Item } from '../../common/properties-layout';
import { useControlState } from '../window-state';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
  newButton: {
    color: theme.palette.success.main,
  },
}));

type ActionType = 'primaryAction' | 'secondaryAction';

const PropertiesControlActions: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, update } = useControlState(id);
  const [currentAction, setCurrentAction] = useState<ActionType>('primaryAction');

  return (
    <Group title={'Actions'} collapse>

      <Tabs value={currentAction} onChange={(e, newValue) => setCurrentAction(newValue)} indicatorColor="primary" textColor="primary">
        <Tab label="Primaire" value="primaryAction"/>
        <Tab label="Secondaire" value="secondaryAction" />
      </Tabs>
      
      <div role="tabpanel" hidden={currentAction !== 'primaryAction'}>
        {currentAction === 'primaryAction' && getActionElement('primaryAction', control, update)}
      </div>

      <div role="tabpanel" hidden={currentAction !== 'secondaryAction'}>
        {currentAction === 'secondaryAction' && getActionElement('secondaryAction', control, update)}
      </div>
    </Group>
  );
};

export default PropertiesControlActions;

function getActionElement(prop: ActionType, control: UiControl, update: (props: Partial<UiControl>) => void) {
  const action = control[prop];
  const updateAction = (props: Partial<Action>) => {
    const newAction = { ...action, ...props };
    update({ [prop]: newAction });
  };

  return <PropertiesAction action={action} update={updateAction} />;
}

const PropertiesAction: FunctionComponent<{ action: Action; update: (props: Partial<Action>) => void }> = ({ action, update }) => {
  return <>Action</>;
}
