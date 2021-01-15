import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import AddIcon from '@material-ui/icons/Add';
import CodeIcon from '@material-ui/icons/Code';

import { UiControl } from '../../../../../store/ui-designer/types';
import { ControlDisplay, ControlDisplayMapItem, ControlText, ControlTextContextItem } from '../../../../../../../shared/ui-model';
import { MemberType } from '../../../../../../../shared/component-model';
import DeleteButton from '../../../../lib/delete-button';
import { clone } from '../../../../lib/clone';
import { Group, Item } from '../../common/properties-layout';
import ResourceSelector from '../../common/resource-selector';
import ComponentMemberSelector from '../../common/component-member-selector';
import { createNewControlDisplay, createNewControlText } from '../../common/templates';
import StringEditor from '../../common/string-editor';
import { useControlState } from '../window-state';

const useStyles = makeStyles(
  (theme) => ({
    newButton: {
      color: theme.palette.success.main,
    },
    spacer: {
      marginLeft: theme.spacing(3),
    },
  }),
  { name: 'properties-control-appearence' }
);

type Appearence = 'display' | 'text';

const PropertiesControlAppearence: FunctionComponent<{ id: string }> = ({ id }) => {
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

  // TODO: min/max depends on state type
  // TODO: useEffect on state type, and reset values on change
  const newItemTemplate: ControlDisplayMapItem = {
    min: null,
    max: null,
    value: null,
    resource: null,
  };

  const { onNew, onRemove, onUpdate } = useArrayManager(display, update, 'map', newItemTemplate);

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
        <Tooltip title="Ajouter une association">
          <IconButton className={classes.newButton} onClick={onNew}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Item>

      {display.map.map((item, index) => (
        <Item key={index}>
          <span>TODO value/range editors</span>
          <Spacer />
          <ResourceSelector value={item.resource} onChange={(value) => onUpdate(index, { resource: value })} />
          <DeleteButton icon tooltip="Supprimer" onConfirmed={() => onRemove(index)} />
        </Item>
      ))}
    </>
  );
};

const PropertiesControlText: FunctionComponent<{ text: ControlText; update: (props: Partial<ControlText>) => void }> = ({ text, update }) => {
  const classes = useStyles();

  const newItemTemplate: ControlTextContextItem = {
    id: null,
    componentId: null,
    componentState: null,
  };

  const { onNew, onRemove, onUpdate } = useArrayManager(text, update, 'context', newItemTemplate);

  return (
    <>
      <Item title={'Format'}>
        <StringEditor value={text.format} onChange={(value) => update({ format: value })} />
        <Tooltip title="Editer">
          <IconButton onClick={() => console.log('TODO: code editor (display code mirror + pouvoir tester la sortie en fournissant des valeurs de context)')}>
            <CodeIcon />
          </IconButton>
        </Tooltip>
      </Item>

      <Item title={'Contexte'}>
        <Tooltip title="Ajouter un élément de contexte">
          <IconButton className={classes.newButton} onClick={onNew}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Item>

      {text.context.map((item, index) => (
        <Item key={index}>
          <StringEditor value={item.id} onChange={(value) => onUpdate(index, { id: value })} />
          <Spacer />
          <ComponentMemberSelector
            memberType={MemberType.STATE}
            value={{ component: item.componentId, member: item.componentState }}
            onChange={(value) => onUpdate(index, { componentId: value.component, componentState: value.member })}
          />
          <DeleteButton icon tooltip="Supprimer" onConfirmed={() => onRemove(index)} />
        </Item>
      ))}
    </>
  );
};

const Spacer = () => {
  const classes = useStyles();
  return <div className={classes.spacer} />;
};

// https://stackoverflow.com/questions/41687152/is-it-possible-to-constrain-a-generic-type-to-be-a-subset-of-keyof-in-typescript
function useArrayManager<Item, Object extends { [key in Key]: Item[] }, Key extends keyof Object>(
  object: Object,
  update: (props: Partial<Object>) => void,
  key: Key & keyof Object,
  newItemTemplate: Item
) {
  const array = object[key];
  const updateArray = (newArray: Item[]) => {
    update({ [key]: newArray } as any); // should do better :(
  };

  const onNew = () => {
    updateArray([...array, clone(newItemTemplate)]);
  };

  const onRemove = (index: number) => {
    const newArray = [...array];
    newArray.splice(index, 1);
    updateArray(newArray);
  };

  const onUpdate = (index: number, props: Partial<Item>) => {
    const newArray = [...array];
    newArray[index] = { ...array[index], ...props };
    updateArray(newArray);
  };

  return { onNew, onRemove, onUpdate };
}
