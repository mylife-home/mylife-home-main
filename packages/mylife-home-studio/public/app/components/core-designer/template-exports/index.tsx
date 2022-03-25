import React, { FunctionComponent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import AddIcon from '@material-ui/icons/Add';

import { Group, Item } from '../../lib/properties-layout';
import { useTabSelector } from '../../lib/use-tab-selector';
import { AppState } from '../../../store/types';
import { getActiveTemplateId, getTemplate, getComponent, getPlugin } from '../../../store/core-designer/selectors';

const TemplateExports: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const template = useActiveTemplate();
  const configIds = useMemo(() => Object.keys(template.exports.config).sort(), [template]);
  const memberIds = useMemo(() => Object.keys(template.exports.members).sort(), [template]);

  return (
    <div className={className}>
      <Group title={
        <>
          Configuration
          <NewButton>
            <div>TODO</div>
          </NewButton>
        </>
      }>
        {configIds.map(id => (<ConfigItem key={id} id={id} />))}
      </Group>

      <Group title={
        <>
          Membres
          <NewButton>
            <div>TODO</div>
          </NewButton>
        </>
      }>
        {memberIds.map(id => (<MemberItem key={id} id={id} />))}
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

const MemberItem: FunctionComponent<{ id: string; }> = ({ id }) => {
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

const NewButton: FunctionComponent = ({ children }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

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
        {children}
      </Popover>
    </>
  );
};
