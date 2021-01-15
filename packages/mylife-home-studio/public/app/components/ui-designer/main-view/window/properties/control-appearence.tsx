import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import AddIcon from '@material-ui/icons/Add';

import { UiControl } from '../../../../../store/ui-designer/types';
import { ControlDisplay, ControlDisplayMapItem, ControlText, ControlTextContextItem } from '../../../../../../../shared/ui-model';
import { MemberType } from '../../../../../../../shared/component-model';
import DeleteButton from '../../../../lib/delete-button';
import { Group, Item } from '../../common/properties-layout';
import ResourceSelector from '../../common/resource-selector';
import ComponentMemberSelector from '../../common/component-member-selector';
import { createNewControlDisplay, createNewControlText } from '../../common/templates';
import { useControlState } from '../window-state';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
}), { name: 'properties-control-appearence' });

type Appearence = 'display' | 'text';

const PropertiesControlAppearence: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { control, update } = useControlState(id);

  const appearence: Appearence = control.display ? 'display' : 'text';
  const setAppearence = (newAppearence: Appearence) => {
    if (newAppearence === appearence) {
      return;
    }

    switch (newAppearence) {
      case 'display':
        update({ text: null, display: createNewControlDisplay() });
        break;

      case 'text':
        update({ display: null, text: createNewControlText() });
        break;
    }
  };

  return (
    <Group title={'Apparence'} collapse>
      <RadioGroup value={appearence} onChange={(e) => setAppearence(e.target.value as Appearence)} row>
        <FormControlLabel value="display" control={<Radio color="primary" />} label="Image" />
        <FormControlLabel value="text" control={<Radio color="primary" />} label="Texte" />
      </RadioGroup>

      {getAppearenceElement(appearence, control, update)}
    </Group>
  );
};

export default PropertiesControlAppearence;

function getAppearenceElement(appearence: Appearence, control: UiControl, update: (props: Partial<UiControl>) => void) {
  switch (appearence) {
    case 'display': {
      const { display } = control;
      const updateDisplay = (props: Partial<ControlDisplay>) => {
        const newDisplay = { ...display, ...props };
        update({ display: newDisplay });
      };

      return <PropertiesControlDisplay display={display} update={updateDisplay} />;
    }

    case 'text': {
      const { text } = control;
      const updateText = (props: Partial<ControlText>) => {
        const newText = { ...text, ...props };
        update({ text: newText });
      };

      return <PropertiesControlText text={text} update={updateText} />;
    }
  }
}

const PropertiesControlDisplay: FunctionComponent<{ display: ControlDisplay; update: (props: Partial<ControlDisplay>) => void }> = ({ display, update }) => {
  const classes = useStyles();

  const onNewMapping = () => {
    // TODO: min/max depends on state type
    const newItem: ControlDisplayMapItem = {
      min: null,
      max: null,
      value: null,
      resource: null,
    };

    update({ map: [...display.map, newItem] });
  };

  return (
    <>
      <Item title={'Par défaut'}>
        <ResourceSelector value={display.defaultResource} onChange={(value) => update({ defaultResource: value })} />
      </Item>
      <Item title={'Composant/État'}>
        <ComponentMemberSelector
          memberType={MemberType.STATE}
          value={{ component: display.componentId, member: display.componentState }}
          onChange={(value) => update({ componentId: value.component, componentState: value.member })}
        />
      </Item>
      <Item title={'Associations'}>
        <IconButton className={classes.newButton} onClick={onNewMapping}>
          <AddIcon />
        </IconButton>
      </Item>

      {display.map.map((item, index) => (
        <Item key={index}>
          <span>TODO value/range editors</span>
          <ResourceSelector value={item.resource} onChange={() => console.log('TODO')} />
          <DeleteButton icon tooltip="Supprimer" onConfirmed={() => console.log('TODO')} />
        </Item>
      ))}

    </>
  );
};

/*
// TODO: add constraint for type Object[key] === Array<Item>
function useArrayManager<Object>(value: Object, update: (props: Partial<Object>) => void, key: keyof Object) {
  const onNew = () => {};
  const onRemove = (index: number) => {};
  const onUpdate = (index: number, props: Partial<Item>) => {};
  return { onNew, onRemove, onUpdate };
}
*/

const PropertiesControlText: FunctionComponent<{ text: ControlText; update: (props: Partial<ControlText>) => void }> = ({ text, update }) => {
  return <>Text</>;
};
