import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import AddIcon from '@material-ui/icons/Add';
import CodeIcon from '@material-ui/icons/Code';

import { AppState } from '../../../../../store/types';
import { UiControl } from '../../../../../store/ui-designer/types';
import { UiControlDisplayData, UiControlTextData } from '../../../../../../../shared/project-manager';
import { MemberType } from '../../../../../../../shared/component-model';
import { getComponentMemberValueType } from '../../../../../store/ui-designer/selectors';
import DeleteButton from '../../../../lib/delete-button';
import { useFireAsync } from '../../../../lib/use-error-handling';
import { Group, Item } from '../../../../lib/properties-layout';
import ResourceSelector from '../../common/resource-selector';
import ComponentMemberSelector, { ComponentAndMember } from '../../common/component-member-selector';
import { createNewControlDisplay, createNewControlDisplayMapItem, createNewControlText, createNewControlTextContextItem } from '../../common/templates';
import StringEditor from '../../common/string-editor';
import { useControlState } from '../view-state';
import TypeEditor from './type-editor';
import { useFormatEditorDialog } from './format-editor-dialog';

type Mutable<T> = { -readonly[P in keyof T]: T[P]};

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
  const { control, update, templateId } = useControlState(id);

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

      {getAppearenceElement(appearence, control, templateId, update)}
    </Group>
  );
};

export default PropertiesControlAppearence;

function getAppearenceElement(appearence: Appearence, control: UiControl, templateId: string, update: (props: Partial<UiControl>) => void) {
  switch (appearence) {
    case 'display': {
      const { display } = control;
      const updateDisplay = (props: Partial<UiControlDisplayData>) => {
        const newDisplay = { ...display, ...props };
        update({ display: newDisplay });
      };

      return <PropertiesControlDisplay display={display} templateId={templateId} update={updateDisplay} />;
    }

    case 'text': {
      const { text } = control;
      const updateText = (props: Partial<UiControlTextData>) => {
        const newText = { ...text, ...props };
        update({ text: newText });
      };

      return <PropertiesControlText text={text} update={updateText} />;
    }
  }
}

const PropertiesControlDisplay: FunctionComponent<{ display: UiControlDisplayData; templateId: string; update: (props: Partial<UiControlDisplayData>) => void }> = ({ display, templateId, update }) => {
  const classes = useStyles();
  const memberValueType = useSelector((state: AppState) => getComponentMemberValueType(state, templateId, display.componentId, display.componentState));
  const { onNew, onRemove, onUpdate } = useArrayManager(display, update, 'map', createNewControlDisplayMapItem);

  const componentChange = (newValue: ComponentAndMember, newMemberValueType: string) => {
    const props: Partial<Mutable<UiControlDisplayData>> = {
      componentId: newValue.component,
      componentState: newValue.member,
    };

    // if type has changed, we need to reset mappings values
    if (memberValueType !== newMemberValueType) {
      props.map = display.map.map(item => ({
        ...item, min: null, max: null, value: null, 
      }));
    }

    update(props);
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
          onChange={componentChange}
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
          <TypeEditor valueType={memberValueType} item={item} onChange={(props) => onUpdate(index, props)} />
          <Spacer />
          <ResourceSelector value={item.resource} onChange={(value) => onUpdate(index, { resource: value })} />
          <DeleteButton icon tooltip="Supprimer" onConfirmed={() => onRemove(index)} />
        </Item>
      ))}
    </>
  );
};

const PropertiesControlText: FunctionComponent<{ text: UiControlTextData; update: (props: Partial<UiControlTextData>) => void }> = ({ text, update }) => {
  const classes = useStyles();
  const { onNew, onRemove, onUpdate } = useArrayManager(text, update, 'context', createNewControlTextContextItem);
  const fireAsync = useFireAsync();
  const showFormatEditorDialog = useFormatEditorDialog();

  const onEdit = () =>
    fireAsync(async () => {
      const { status, updateData } = await showFormatEditorDialog(text);
      if (status === 'ok') {
        update(updateData);
      }
    });

  return (
    <>
      <Item title={'Format'}>
        <StringEditor value={text.format} onChange={(value) => update({ format: value })} rows={3} />
        <Tooltip title="Editer">
          <IconButton onClick={onEdit}>
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
            onChange={(value) => onUpdate(index, { componentId: value.component, componentState: value.member, testValue: null })}
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
  newItemFactory: () => Item
) {
  const array = object[key];
  const updateArray = (newArray: Item[]) => {
    update({ [key]: newArray } as any); // should do better :(
  };

  const onNew = () => {
    updateArray([...array, newItemFactory()]);
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
