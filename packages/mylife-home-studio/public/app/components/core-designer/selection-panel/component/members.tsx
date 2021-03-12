import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { StateIcon, ActionIcon } from '../../../lib/icons';
import { useSelection } from '../../selection';
import { Group, Item } from '../../../lib/properties-layout';

import * as types from '../../../../store/core-designer/types';
import { getBinding } from '../../../../store/core-designer/selectors';

import { useComponentData } from './common';

const useStyles = makeStyles((theme) => ({
  newButton: {
    alignSelf: 'flex-start',
    color: theme.palette.success.main,
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(-0.5),
  },
  separator: {
    width: '100%',
    height: theme.spacing(5),
  }
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

        <Tooltip title="Nouveau binding">
          <IconButton className={classes.newButton} onClick={() => console.log('TODO new')}>
            <AddIcon />
          </IconButton>
        </Tooltip>

      </Item>

      <div className={classes.separator} />
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
  const { select } = useSelection();
  const BindingIcon = getBindingIcon(memberType);
  const binding = useTabSelector((state, tabId) => getBinding(state, tabId, id));
  const handleSelect = () => select({ type: 'binding', id: binding.id });

  return (
    <Link variant="body1" color="textPrimary" href="#" className={classes.bindingLink} onClick={handleSelect}>
      <BindingIcon />
      {getBindingDisplay(binding, memberType)}
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

function getBindingDisplay(binding: types.Binding, memberType: types.MemberType) {
  switch (memberType) {
    case types.MemberType.STATE:
      return `${binding.targetComponent}.${binding.targetAction}`;
    case types.MemberType.ACTION:
      return `${binding.sourceComponent}.${binding.sourceState}`;
  }
}
