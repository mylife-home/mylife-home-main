import React, { FunctionComponent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Popover from '@material-ui/core/Popover';
import AddIcon from '@material-ui/icons/Add';

import { Group, Item } from '../../lib/properties-layout';
import { useTabSelector } from '../../lib/use-tab-selector';
import { AppState } from '../../../store/types';
import { getActiveTemplateId, getComponentIds, getTemplate, getComponent, getPlugin, getComponentsMap, getPluginsMap } from '../../../store/core-designer/selectors';

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

  return (
    <div className={className}>
      <Group title={
        <>
          Configuration
          <NewButton content={NewConfigPopoverContent} />
        </>
      }>
        {configIds.map(id => (<ConfigItem key={id} id={id} />))}
      </Group>

      <Group title={
        <>
          Membres
          <NewButton content={NewMemberPopoverContent} />
        </>
      }>
        {memberIds.map(id => (<PropertyItem key={id} id={id} />))}
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

  return (
    <Item title={id}>
      {component.componentId}
      {config.configName}
      {configMeta.description}
      {configMeta.valueType}
    </Item>
  );
};

const PropertyItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const template = useActiveTemplate();
  const member = template.exports.members[id];
  const { component, plugin } = useComponentAndPlugin(member.component);
  const memberMeta = plugin.members[member.member];

  return (
    <Item title={id}>
      {component.componentId}
      {member.member}
      {memberMeta.description}
      {memberMeta.memberType}
      {memberMeta.valueType}
    </Item>
  );
};

function useActiveTemplate() {
  const templateId = useTabSelector(getActiveTemplateId);
  return useSelector((state: AppState) => getTemplate(state, templateId));
}

function useComponentAndPlugin(id: string) {
  const component = useSelector((state: AppState) => getComponent(state, id));
  const plugin = useSelector((state: AppState) => getPlugin(state, component.plugin));
  return { component, plugin };
}

const NewButton: FunctionComponent<{content: FunctionComponent<{ onClose: () => void; }>}> = ({ content }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  const Content = content;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>

      <IconButton className={classes.button} onClick={handleClick}>
        <AddIcon />
      </IconButton>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <Content onClose={handleClose} />
      </Popover>
    </>
  );
};

const NewConfigPopoverContent: FunctionComponent<{ onClose: () => void; }> = ({ onClose }) => {
  const classes = useStyles();
  const list = useConfigList();

  const onSelect = (value: PropertyItem) => {
    console.log('select', value);
    onClose();
  };

  return (
    <div className={classes.container}>
      <PropertySelector className={classes.selector} list={list} onSelect={onSelect} />
    </div>
  );
};

const NewMemberPopoverContent: FunctionComponent<{ onClose: () => void; }> = ({ onClose }) => {
  const classes = useStyles();
  const list = useMemberList();

  const onSelect = (value: PropertyItem) => {
    console.log('select', value);
    onClose();
  };

  return (
    <div className={classes.container}>
      <PropertySelector className={classes.selector} list={list} onSelect={onSelect} />
    </div>
  );
};

interface PropertyItem {
  componentId: string;
  componentName: string;
  propertyName: string;
}

const PropertySelector: FunctionComponent<{ className?: string; list: PropertyItem[]; onSelect: (value: PropertyItem) => void; }> = ({ className, list, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={null}
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
