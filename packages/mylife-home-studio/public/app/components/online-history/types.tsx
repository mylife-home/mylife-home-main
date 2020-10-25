import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Badge from '@material-ui/core/Badge';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import { InstanceIcon, ComponentIcon, StateIcon } from '../lib/icons';
import { HistoryItemType } from '../../store/online-history/types';

const useStyles = makeStyles((theme) => ({
  set: {
    background: null,
    color: theme.palette.success.main
  },
  clear: {
    background: null,
    color: theme.palette.error.main
  },
}));

const BADGE_ICON_BY_MOVE = {
  set: ArrowRightIcon,
  clear: ArrowLeftIcon,
};

export const TypeIcon: FunctionComponent<{ type: HistoryItemType }> = ({ type }) => {
  const classes = useStyles();
  const { Icon, move } = getTypeInfos(type);

  if (move === 'none') {
    return <Icon />;
  }

  const BadgeIcon = BADGE_ICON_BY_MOVE[move];

  return (
    <Badge badgeContent={<BadgeIcon />} classes={{badge: classes[move]}}>
      <Icon />
    </Badge>
  );
};

export const TypeLabel: FunctionComponent<{ type: HistoryItemType }> = ({ type }) => {
  const { label } = getTypeInfos(type);
  return (
    <>
      {label}
    </>
  )
};

function getTypeInfos(value: HistoryItemType): { Icon: typeof SvgIcon; move: 'set' | 'clear' | 'none'; label: string; } {
  switch (value) {
    case 'instance-set':
      return { Icon: InstanceIcon, move: 'set', label: 'Instance arrivée' };
    case 'instance-clear':
      return { Icon: InstanceIcon, move: 'clear', label: 'Instance partie' };
    case 'component-set':
      return { Icon: ComponentIcon, move: 'set', label: 'Composant arrivé' };
    case 'component-clear':
      return { Icon: ComponentIcon, move: 'clear', label: 'Composant parti' };
    case 'state-set':
      return { Icon: StateIcon, move: 'none', label: 'État changé' };
  }
}
