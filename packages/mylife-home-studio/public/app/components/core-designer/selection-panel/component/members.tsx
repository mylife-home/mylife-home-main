import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { useTabPanelId } from '../../../lib/tab-panel';
import { StateIcon, ActionIcon } from '../../../lib/icons';
import { useSelectBinding } from '../../selection';
import { Group, Item } from '../../../lib/properties-layout';
import { AppState } from '../../../../store/types';
import * as types from '../../../../store/core-designer/types';
import { setBinding } from '../../../../store/core-designer/actions';
import { getBinding, getNewBindingHalfList, getSelectedComponent, getComponentsMap } from '../../../../store/core-designer/selectors';
import { useComponentData } from './common';
import { BindingHalf, createBindingData } from '../../binding-tools';

const useStyles = makeStyles((theme) => ({
  newButton: {
    alignSelf: 'flex-start',
  },
}), { name: 'properties-component-members' });

const Members: FunctionComponent = () => {
  const { plugin } = useComponentData();

  return (
    <Group title="Membres" collapse>
      {plugin.stateIds.map(id => 
        <Member key={id} name={id} />
      )}

      {plugin.actionIds.map(id => 
        <Member key={id} name={id} />
      )}
    </Group>
  );
};

export default Members;

const Member: FunctionComponent<{ name: string }> = ({ name }) => {
  const classes = useStyles();
  const { component, plugin } = useComponentData();
  const member = plugin.members[name];
  const bindings = component.bindings[name];
  
  return (
    <>
      <Item multiline noTitleTypography title={
        <MemberTitle memberType={member.memberType} name={name} description={member.description} />
      }>
        <Typography>{member.valueType}</Typography>

        {bindings && bindings.map(id => 
          <MemberBinding key={id} id={id} memberType={member.memberType} />
        )}

        <NewBindingButton className={classes.newButton} memberName={name} />

      </Item>

      <Separator />
    </>
  );
};

const useTitleStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'flex',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}), { name: 'properties-component-member-title' });

const MemberTitle: FunctionComponent<{ memberType: types.MemberType; name: string; description: string; }> = ({ memberType, name, description }) => {
  const classes = useTitleStyles();
  const MemberIcon = getMemberIcon(memberType);

  return (
    <div className={classes.container}>
      <Typography className={classes.title}>
        <MemberIcon className={classes.icon}/>
        {name}
      </Typography>

      <Typography color="textSecondary">{description}</Typography>
    </div>
  );
}

function getMemberIcon(memberType: types.MemberType) {
  switch(memberType) {
    case types.MemberType.STATE:
      return StateIcon;
    case types.MemberType.ACTION:
      return ActionIcon;
  }
}

const useBindingStyles = makeStyles((theme) => ({
  bindingLink: {
    display: 'flex',
  }
}), { name: 'properties-component-binding' });

const MemberBinding: FunctionComponent<{ id: string; memberType: types.MemberType }> = ({ id, memberType }) => {
  const classes = useBindingStyles();
  const selectBinding = useSelectBinding();
  const select = useCallback(() => selectBinding(id), [selectBinding, id]);
  const BindingIcon = getBindingIcon(memberType);
  const binding = useSelector(useCallback((state: AppState) => getBinding(state, id), [id]));
  const componentsMap = useSelector(getComponentsMap);

  return (
    <Link variant="body1" color="textPrimary" href="#" className={classes.bindingLink} onClick={select}>
      <BindingIcon />
      {getBindingDisplay(binding, componentsMap, memberType)}
    </Link>
  );
};

function getBindingIcon(memberType: types.MemberType) {
  switch (memberType) {
    case types.MemberType.STATE:
      return ArrowForwardIcon;
    case types.MemberType.ACTION:
      return ArrowBackIcon;
  }
}

function getBindingDisplay(binding: types.Binding, componentsMap: { [id: string]: types.Component }, memberType: types.MemberType) {
  switch (memberType) {
    case types.MemberType.STATE: {
      const { componentId } = componentsMap[binding.targetComponent];
      return `${componentId}.${binding.targetAction}`;
    }
    
    case types.MemberType.ACTION: {
      const { componentId } = componentsMap[binding.sourceComponent];
      return `${componentId}.${binding.sourceState}`;
    }
  }
}

const useNewBindingStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.success.main,
    padding: theme.spacing(0.5),
    margin: theme.spacing(-0.5),
  },
  container: {
    padding: theme.spacing(2),
  },
  selector: {
    width: 300
  }
}), { name: 'properties-component-new-binding' });

const NewBindingButton: FunctionComponent<{ className?: string; memberName: string; }> = ({ className, memberName }) => {
  const classes = useNewBindingStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>

      <Tooltip title="Nouveau binding">
        <IconButton className={clsx(className, classes.button)} onClick={handleClick}>
          <AddIcon />
        </IconButton>
      </Tooltip>

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
        <NewBindingPopoverContent memberName={memberName} onClose={handleClose} />
      </Popover>
    </>
  );
};

const NewBindingPopoverContent: FunctionComponent<{ memberName: string; onClose: () => void; }> = ({ memberName, onClose }) => {
  const classes = useNewBindingStyles();
  const componentId = useTabSelector(getSelectedComponent);
  const list = useTabSelector((state, tabId) => getNewBindingHalfList(state, tabId, componentId, memberName));
  const newBinding = useNewBinding(memberName);

  const onSelect = (value: BindingHalf) => {
    newBinding(value);
    onClose();
  };

  return (
    <div className={classes.container}>
      <NewBindingSelector className={classes.selector} list={list} onSelect={onSelect} />
    </div>
  );
};

const NewBindingSelector: FunctionComponent<{ className?: string; list: BindingHalf[]; onSelect: (value: BindingHalf) => void; }> = ({ className, list, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={null}
      onChange={(event, newValue: BindingHalf) => {
        onSelect(newValue);
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={list}
      getOptionLabel={(option: BindingHalf) => `${option.componentId}.${option.memberName}`}
      getOptionSelected={getOptionSelected}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Nouveau binding"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

function getOptionSelected(option: BindingHalf, value: BindingHalf) {
  if (!option && !value) {
    return true;
  }

  if (!option || !value) {
    return false;
  }

  return option.componentId === value.componentId && option.memberName === value.memberName;
}

function useNewBinding(memberName: string) {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const { component, plugin } = useComponentData();
  const member = plugin.members[memberName];

  return useCallback((newValue: BindingHalf) => {
    const binding = createBindingData(component.id, memberName, member.memberType, newValue);
    dispatch(setBinding({ tabId, binding }));
  }, [dispatch, tabId, component.id, memberName]);
}

const useSeparatorStyles = makeStyles((theme) => ({
  main: {
    width: '100%',
    height: theme.spacing(5),
  }
}), { name: 'properties-component-separator' });

const Separator: FunctionComponent = () => {
  const classes = useSeparatorStyles();
  return (
    <div className={classes.main} />
  );
};
