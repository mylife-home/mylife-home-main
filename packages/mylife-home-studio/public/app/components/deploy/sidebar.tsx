import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { RecipeIcon, StartIcon, RunsIcon, FileIcon } from './icons';
import { getPinnedRecipesIds } from '../../store/deploy/selectors';

const useStyles = makeStyles((theme) => ({
  section: {},
  item: {
    paddingLeft: theme.spacing(8),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const SideBar: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <List>
      <Recipes />
      <Divider className={classes.divider} />
      <Runs />
      <Divider className={classes.divider} />
      <Files />
    </List>
  );
};

export default SideBar;

const Recipes: FunctionComponent = () => {
  const { recipesIds } = useConnectRecipes();
  return (
    <>
      <Section title="Recettes" icon={RecipeIcon} onClick={() => console.log('recipes')} />
      {recipesIds.map((id) => (
        <Item
          key={id}
          title={id}
          icon={RecipeIcon}
          onClick={() => console.log(`recipe ${id}`)}
          secondary={{ tooltip: 'Démarrer la recette', icon: StartIcon, onClick: () => console.log(`start recipe ${id}`) }}
        />
      ))}
    </>
  );
};

function useConnectRecipes() {
  return {
    recipesIds: useSelector(getPinnedRecipesIds),
  };
}

const Runs: FunctionComponent = () => {
  return (
    <>
      <Section title="Exécutions" icon={RunsIcon} onClick={() => console.log('runs')} />
    </>
  );
};

const Files: FunctionComponent = () => {
  return (
    <>
      <Section title="Fichiers" icon={FileIcon} onClick={() => console.log('files')} />
    </>
  );
};

interface BaseItemProps {
  title: string;
  icon: typeof SvgIcon;
  onClick: () => void;
}

interface SectionProps extends BaseItemProps {}

interface ItemProps extends BaseItemProps {
  secondary?: {
    tooltip: string;
    icon: typeof SvgIcon;
    onClick: () => void;
  };
}

const Section: FunctionComponent<SectionProps> = ({ title, icon, onClick }) => {
  const classes = useStyles();
  const Icon = icon;

  return (
    <ListItem button className={classes.section} onClick={onClick}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={title} primaryTypographyProps={{ variant: 'h6' }} />
    </ListItem>
  );
};

const Item: FunctionComponent<ItemProps> = ({ title, icon, onClick, secondary }) => {
  const classes = useStyles();
  const Icon = icon;
  const SecondaryIcon = secondary?.icon;

  return (
    <ListItem button className={classes.item} onClick={onClick}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={title} primaryTypographyProps={{ variant: 'body1' }} />
      {secondary && (
        <ListItemSecondaryAction>
          <Tooltip title={secondary.tooltip}>
            <IconButton edge="end" onClick={secondary.onClick}>
              <SecondaryIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};
