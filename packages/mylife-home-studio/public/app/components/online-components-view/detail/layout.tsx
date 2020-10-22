import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import SvgIcon from '@material-ui/core/SvgIcon';

import { NodeType, ICONS_BY_TYPE } from '../common';

const useTitleStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),

    '& *': {
      marginRight: theme.spacing(3),
    }
  }
}));

export const Title: FunctionComponent<{ type?: NodeType; title: string; }> = ({ type, title }) => {
  const classes = useTitleStyles();
  const Icon = ICONS_BY_TYPE[type] || React.Fragment;

  return (
    <div className={classes.container}>
      <Icon />
      <Typography variant='h6' >
        {title}
      </Typography>
    </div>
  );
};

const useDividerStyles = makeStyles((theme) => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

export const SectionDivider: FunctionComponent = () => {
  const classes = useDividerStyles();
  return (
    <Divider className={classes.divider} />
  );
};

const useItemStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
  
    '& *': {
      marginRight: theme.spacing(1),
    }
  }
}));

interface ItemProps {
  className?: string;
  icon?: typeof SvgIcon;
  value: string; 
};

export const Item: FunctionComponent<ItemProps> = ({ className, icon, value }) => {
  const classes = useItemStyles();
  const Icon = icon;
  return (
    <div className={clsx(classes.container, className)}>
      {Icon && (<Icon fontSize='small' />)}
      <Typography>
        {value}
      </Typography>
    </div>
  );
};

const useSectionTitleStyles = makeStyles((theme) => ({
  item: {
    marginBottom: theme.spacing(2),
  }
}));

export const SectionTitle: FunctionComponent<Omit<ItemProps, 'className'> > = (props) => {
  const classes = useSectionTitleStyles();
  return (
    <Item className={classes.item} {...props} />
  );
};

export const Count: FunctionComponent<{ icon?: typeof SvgIcon; value: number; singular: string; plural: string; }> = ({ icon, value, singular, plural }) => (
  <Item icon={icon} value={`${value} ${value > 1 ? plural : singular}`} />
);

export const NameValue: FunctionComponent<{ icon?: typeof SvgIcon; name: string; value: string; }> = ({ icon, name, value }) => (
  <Item icon={icon} value={`${name} : ${value || '<non défini>'}`} />
);
