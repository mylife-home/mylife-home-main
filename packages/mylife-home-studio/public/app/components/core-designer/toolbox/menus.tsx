import React, { ReactNode, MouseEvent, FunctionComponent, forwardRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import SvgIcon from '@material-ui/core/SvgIcon';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DeleteIcon from '@material-ui/icons/Delete';

import { AppState } from '../../../store/types';
import { getPlugin, getInstanceStats, getPluginStats, getTemplateStats } from '../../../store/core-designer/selectors';
import { updateToolbox } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  deleteIcon: {
    color: theme.palette.error.main,
  },
}));

export const InstanceMenuButton: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const stats = useSelector(useCallback((state: AppState) => getInstanceStats(state, id), [id]));
  const updateToolbox = useToolboxUpdateAction('instance', id);

  return (
    <ButtonMenu>
      {stats.hasHidden && <ActionItem onClick={() => updateToolbox('show')} icon={VisibilityIcon} title="Montrer tous les plugins" />}
      {stats.hasShown && <ActionItem onClick={() => updateToolbox('hide')} icon={VisibilityOffIcon} title="Cacher tous les plugins" />}
      <ActionItem onClick={() => updateToolbox('delete')} icon={DeleteIcon} iconClassName={classes.deleteIcon} title="Supprimer tous les plugins inutilisés" />
      <Stats
        items={[
          { count: stats.plugins, singular: 'plugin', plural: 'plugins' },
          { count: stats.components, singular: 'composant', plural: 'composants' },
          { count: stats.externalComponents, singular: 'composant externe', plural: 'composants externes' },
        ]}
      />
    </ButtonMenu>
  );
};

export const PluginMenuButton: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const plugin = useSelector(useCallback((state: AppState) => getPlugin(state, id), [id]));
  const stats = useSelector(useCallback((state: AppState) => getPluginStats(state, id), [id]));
  const updateToolbox = useToolboxUpdateAction('plugin', id);

  return (
    <ButtonMenu>
      {plugin.toolboxDisplay === 'show' && <ActionItem onClick={() => updateToolbox('hide')} icon={VisibilityOffIcon} title="Cacher" />}
      {plugin.toolboxDisplay === 'hide' && <ActionItem onClick={() => updateToolbox('show')} icon={VisibilityIcon} title="Montrer" />}
      {stats.use === 'unused' && <ActionItem onClick={() => updateToolbox('delete')} icon={DeleteIcon} iconClassName={classes.deleteIcon} title="Supprimer" />}
      <Stats
        items={[
          { count: stats.components, singular: 'composant', plural: 'composants' },
          { count: stats.externalComponents, singular: 'composant externe', plural: 'composants externes' },
        ]}
      />
    </ButtonMenu>
  );
};

export const TemplateMenuButton: FunctionComponent<{ id: string }> = ({ id }) => {
  const stats = useSelector(useCallback((state: AppState) => getTemplateStats(state, id), [id]));

  return (
    <ButtonMenu>
      <Stats
        items={[
          { count: stats.components, singular: 'composant', plural: 'composants' },
          { count: stats.externalComponents, singular: 'composant externe', plural: 'composants externes' },
        ]}
      />
    </ButtonMenu>
  );
};

const ButtonMenu: FunctionComponent = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton aria-haspopup="true" onClick={handleClick}>
        <MoreHorizIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} keepMounted open={!!anchorEl} onClose={handleClose} onClick={handleClose}>
        {children}
      </Menu>
    </>
  );
};

const ActionItem = forwardRef<HTMLLIElement, { icon: typeof SvgIcon; iconClassName?: string; title: string; onClick: () => void }>(
  ({ icon, iconClassName, title, onClick }, ref) => {
    const Icon = icon;
    return (
      <MenuItem ref={ref} onClick={onClick}>
        <ListItemIcon className={iconClassName}>
          <Icon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit" noWrap>
          {title}
        </Typography>
      </MenuItem>
    );
  }
);

type StatItem = { count: number; singular: string; plural: string };

const Stats = forwardRef<HTMLLIElement, { items: StatItem[] }>(({ items }, ref) => {
  const displayableItems = items.filter((item) => item.count > 0);
  if (!displayableItems.length) {
    return null;
  }

  const content: ReactNode[] = [];

  for (const [index, { count, singular, plural }] of displayableItems.entries()) {
    const last = index === items.length - 1;

    content.push(`${count} ${count > 1 ? plural : singular}`);

    if (!last) {
      content.push(<br key={index} />);
    }
  }

  return <ListItem>{content}</ListItem>;
});

function useToolboxUpdateAction(itemType: 'instance' | 'plugin', itemId: string) {
  const dispatch = useDispatch();
  return useCallback(
    (action: 'show' | 'hide' | 'delete') => {
      dispatch(updateToolbox({ itemType, itemId, action }));
    },
    [dispatch, itemType, itemId]
  );
}
