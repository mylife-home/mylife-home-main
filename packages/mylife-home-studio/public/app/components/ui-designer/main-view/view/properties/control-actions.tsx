import React, { FunctionComponent, useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Checkbox from '@material-ui/core/Checkbox';

import { UiControl } from '../../../../../store/ui-designer/types';
import { Action, ActionComponent, ActionWindow } from '../../../../../../../shared/ui-model';
import { MemberType } from '../../../../../../../shared/component-model';
import { Group, Item } from '../../../../lib/properties-layout';
import { createNewControlActionComponent, createNewControlActionWindow } from '../../common/templates';
import WindowSelector from '../../common/window-selector';
import ComponentMemberSelector from '../../common/component-member-selector';
import { useControlState } from '../view-state';

type ActionType = 'primaryAction' | 'secondaryAction';

const PropertiesControlActions: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, update } = useControlState(id);
  const [currentAction, setCurrentAction] = useState<ActionType>('primaryAction');
  const isPrimary = !!control.primaryAction;
  const isSecondary = !!control.secondaryAction;

  return (
    <Group title={'Actions'} collapse>

      <Tabs value={currentAction} onChange={(e, newValue) => setCurrentAction(newValue)} indicatorColor="primary" textColor="primary">
        <Tab label={'Primaire' + mark(isPrimary)} value="primaryAction"/>
        <Tab label={'Secondaire' + mark(isSecondary)} value="secondaryAction" />
      </Tabs>

      <TabPanel value="primaryAction" currentValue={currentAction}>
        {getActionElement('primaryAction', control, update)}
      </TabPanel>

      <TabPanel value="secondaryAction" currentValue={currentAction}>
        {getActionElement('secondaryAction', control, update)}
      </TabPanel>
    </Group>
  );
};

export default PropertiesControlActions;

function mark(value: boolean) {
  return value ? ' *' : '';
}

const TabPanel: FunctionComponent<{ value: ActionType; currentValue: ActionType }> = ({ value, currentValue, children }) => (
  <div role="tabpanel" hidden={currentValue !== value}>
    {currentValue === value && children}
  </div>
);

function getActionElement(prop: ActionType, control: UiControl, update: (props: Partial<UiControl>) => void) {
  const action = control[prop];
  const updateAction = (action: Action) => {
    update({ [prop]: action });
  };

  return <PropertiesAction action={action} update={updateAction} />;
}

type ActionItemType = 'none' | 'component' | 'window';

const PropertiesAction: FunctionComponent<{ action: Action; update: (action: Action) => void }> = ({ action, update }) => {
  const actionType = getActionItemType(action);
  const setActionType = (newActionType: ActionItemType) => {
    if (newActionType === actionType) {
      return;
    }

    switch (newActionType) {
      case 'none':
        update(null);
        break;

      case 'component':
        update(createNewControlActionComponent());
        break;

      case 'window':
        update(createNewControlActionWindow());
        break;
    }
  };

  return (
    <>
      <RadioGroup value={actionType} onChange={(e) => setActionType(e.target.value as ActionItemType)} row>
        <FormControlLabel value="none" control={<Radio color="primary" />} label="Aucun" />
        <FormControlLabel value="component" control={<Radio color="primary" />} label="Composant" />
        <FormControlLabel value="window" control={<Radio color="primary" />} label="Fenêtre" />
      </RadioGroup>

      {getActionItemElement(actionType, action, update)}
    </>
  );
};

function getActionItemType(action: Action): ActionItemType {
  if (!action) {
    return 'none';
  }

  if (action.component) {
    return 'component';
  } else if (action.window) {
    return 'window';
  } else {
    throw new Error('Bad action: component and window both null');
  }
}

function getActionItemElement(actionType: ActionItemType, action: Action, update: (action: Action) => void) {
  switch (actionType) {
    case 'none': {
      return null;
    }

    case 'component': {
      const { component } = action;
      const updateComponent = (props: Partial<ActionComponent>) => {
        const newComponent = { ...component, ...props };
        update({ component: newComponent, window: null });
      };

      return <PropertiesActionComponent component={component} update={updateComponent} />;
    }

    case 'window': {
      const { window } = action;
      const updateWindow = (props: Partial<ActionWindow>) => {
        const newWindow = { ...window, ...props };
        update({ component: null, window: newWindow });
      };

      return <PropertiesActionWindow window={window} update={updateWindow} />;
    }
  }
}

const PropertiesActionComponent: FunctionComponent<{ component: ActionComponent; update: (props: Partial<ActionComponent>) => void }> = ({ component, update }) => (
  <Item title={'Composant/Action'}>
    <ComponentMemberSelector
      memberType={MemberType.ACTION}
      filter={(name, member) => member.valueType === 'bool'}
      value={{ component: component.id, member: component.action }}
      onChange={(value) => update({ id: value.component, action: value.member })}
    />
  </Item>
);

const PropertiesActionWindow: FunctionComponent<{ window: ActionWindow; update: (props: Partial<ActionWindow>) => void }> = ({ window, update }) => (
  <>
    <Item title={'Fenêtre'}>
      <WindowSelector value={window.id} onChange={value => update({ id: value })} />
    </Item>
    <Item title={'Popup'}>
      <Checkbox color="primary" checked={window.popup} onChange={e => update({ popup: e.target.checked })} />
    </Item>
  </>
);
