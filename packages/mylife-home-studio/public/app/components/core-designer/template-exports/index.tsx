import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';

import { StateIcon, ActionIcon } from '../../lib/icons';
import { Group, Item } from '../../lib/properties-layout';
import { useTabSelector } from '../../lib/use-tab-selector';
import DeleteButton from '../../lib/delete-button';
import { AppState } from '../../../store/types';
import { MemberType } from '../../../store/core-designer/types';
import { getActiveTemplateId, getComponentIds, getTemplate, getComponent, getPlugin, getComponentsMap, getPluginsMap } from '../../../store/core-designer/selectors';
import { setTemplateExport, clearTemplateExport } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.success.main,
  },
  container: {
    padding: theme.spacing(2),
  },
  selector: {
    width: 300
  }
}), { name: 'template-exports' });

const TemplateExports: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const template = useActiveTemplate();
  const configIds = useMemo(() => Object.keys(template.exports.config).sort(), [template]);
  const memberIds = useMemo(() => Object.keys(template.exports.members).sort(), [template]);
  const configList = useConfigList();
  const memberList = useMemberList();

  return (
    <div className={className}>
      <Group title="Configuration">
        {configIds.map(id => (<ConfigItem key={id} id={id} />))}

        <NewItem existingIds={configIds} propertyList={configList} exportType='config' />
      </Group>

      <Group title="Membres">
        {memberIds.map(id => (<MemberItem key={id} id={id} />))}

        <NewItem existingIds={memberIds} propertyList={memberList} exportType='member' />
      </Group>

    </div>
  );
};

export default TemplateExports;

const ConfigItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const template = useActiveTemplate();
  const config = template.exports.config[id];
  const { component, plugin } = useComponentAndPlugin(config.component);
  const configMeta = plugin.config[config.configName];
  const clear = useClearExport('config', id);

  const description = configMeta.description ? `${configMeta.description} (${configMeta.valueType})` : configMeta.valueType;

  return (
    <Item title={id}>
      {`${component.componentId}.${config.configName}`}
      {description}
      <DeleteButton icon tooltip="Supprimer" onConfirmed={clear} />
    </Item>
  );
};

const MemberItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const template = useActiveTemplate();
  const member = template.exports.members[id];
  const { component, plugin } = useComponentAndPlugin(member.component);
  const memberMeta = plugin.members[member.member];
  const clear = useClearExport('member', id);

  const MemberIcon = getMemberIcon(memberMeta.memberType);
  const description = memberMeta.description ? `${memberMeta.description} (${memberMeta.valueType})` : memberMeta.valueType;

  return (
    <Item title={id}>
      <MemberIcon />
      {`${component.componentId}.${member.member}`}
      {description}
      <DeleteButton icon tooltip="Supprimer" onConfirmed={clear} />
    </Item>
  );
};

function getMemberIcon(memberType: MemberType) {
  switch (memberType) {
    case MemberType.STATE:
      return StateIcon;
    case MemberType.ACTION:
      return ActionIcon;
  }
}

const NewItem: FunctionComponent<{ existingIds: string[]; propertyList: PropertyItem[]; exportType: 'config' | 'member'; }> = ({ existingIds, propertyList, exportType }) => {
  const classes = useStyles();
  const [id, setId] = useState<string>('');
  const [property, setProperty] = useState<PropertyItem>(null);
  const { valid, reason } = useMemo(() => validateId(id, existingIds), [id, existingIds]);
  const dispatch = useDispatch();

  const onNewClick = useCallback(() => {
    dispatch(setTemplateExport({ exportType, exportId: id, componentId: property.componentId, propertyName: property.propertyName }));
    setProperty(null);
    setId('');
  }, [dispatch, exportType, id, property, setProperty, setId]);

  return (
    <Item title="new">

      <TextField fullWidth value={id} onChange={(e) => setId(e.target.value)} error={!!reason} helperText={reason} />
      
      <PropertySelector className={classes.selector} list={propertyList} value={property} onSelect={setProperty} />

      <IconButton className={classes.button} onClick={onNewClick} disabled={!valid}>
        <AddIcon />
      </IconButton>

    </Item>
  );
};

function validateId(value: string, existingIds: string[]): { valid: boolean, reason?: string } {
  if (!value) {
    return { valid: false };
  }

  if (existingIds.includes(value)) {
    return { valid: false, reason: 'Ce nom existe déjà' };
  }

  return { valid: true };
}

interface PropertyItem {
  componentId: string;
  componentName: string;
  propertyName: string;
}

const PropertySelector: FunctionComponent<{ className?: string; list: PropertyItem[]; value: PropertyItem; onSelect: (value: PropertyItem) => void; }> = ({ className, list, value, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={value}
      onChange={(event, newValue: PropertyItem) => {
        onSelect(newValue);
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={list}
      getOptionLabel={(option: PropertyItem) => `${option.componentName}.${option.propertyName}`}
      getOptionSelected={getOptionSelected}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

function getOptionSelected(option: PropertyItem, value: PropertyItem) {
  if (!option && !value) {
    return true;
  }

  if (!option || !value) {
    return false;
  }

  return option.componentId === value.componentId && option.propertyName === value.propertyName;
}

function useActiveTemplate() {
  const templateId = useTabSelector(getActiveTemplateId);
  return useSelector((state: AppState) => getTemplate(state, templateId));
}

function useComponentAndPlugin(id: string) {
  const component = useSelector((state: AppState) => getComponent(state, id));
  const plugin = useSelector((state: AppState) => getPlugin(state, component.plugin));
  return { component, plugin };
}

function useClearExport(exportType: 'config' | 'member', exportId: string) {
  const templateId = useTabSelector(getActiveTemplateId);
  const dispatch = useDispatch();

  return useCallback(() => {

    // TODO: check usage

    dispatch(clearTemplateExport({ templateId, exportType, exportId }))
  }, [dispatch, templateId, exportType, exportId]);
}

function useMemberList() {
  const componentsIds = useTabSelector(getComponentIds);
  const componentsMap = useSelector(getComponentsMap);
  const pluginsMap = useSelector(getPluginsMap);

  return useMemo(() => {
    const list: PropertyItem[] = [];

    for (const componentId of componentsIds) {
      const component = componentsMap[componentId];
      const plugin = pluginsMap[component.plugin];
  
      for (const memberId of [...plugin.stateIds, ...plugin.actionIds]) {
        list.push({
          componentId: component.id,
          componentName: component.componentId,
          propertyName: memberId
        });
      }
    }
  
    return list;
  }, [componentsIds, componentsMap, pluginsMap]);
}

function useConfigList() {
  const componentsIds = useTabSelector(getComponentIds);
  const componentsMap = useSelector(getComponentsMap);
  const pluginsMap = useSelector(getPluginsMap);

  return useMemo(() => {
    const list: PropertyItem[] = [];

    for (const componentId of componentsIds) {
      const component = componentsMap[componentId];
      const plugin = pluginsMap[component.plugin];
  
      for (const configId of plugin.configIds) {
        list.push({
          componentId: component.id,
          componentName: component.componentId,
          propertyName: configId
        });
      }
    }
  
    return list;
  }, [componentsIds, componentsMap, pluginsMap]);
}
