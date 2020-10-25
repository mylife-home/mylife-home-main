import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import { AppState } from '../../../store/types';
import { InstanceIcon, ComponentIcon, StateIcon } from '../../lib/icons';
import { HistoryItemType } from '../../../store/online-history/types';
import { getItem } from '../../../store/online-history/selectors';

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

const Type: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const item = useItem(id);
  const { Icon, move, tooltip } = getTypeInfos(item.type);

  let inner: JSX.Element;

  if (move === 'none') {
    inner = <Icon />;
  } else {

    const BadgeIcon = BADGE_ICON_BY_MOVE[move];
  
    inner = (
      <Badge badgeContent={<BadgeIcon />} classes={{badge: classes[move]}}>
        <Icon />
      </Badge>
    );
  }

  return (
    <Tooltip title={tooltip}>
      {inner}      
    </Tooltip>
  );
};

export default Type;

function getTypeInfos(value: HistoryItemType): { Icon: typeof SvgIcon; move: 'set' | 'clear' | 'none'; tooltip: string; } {
  switch (value) {
    case 'instance-set':
      return { Icon: InstanceIcon, move: 'set', tooltip: 'Instance arrivée' };
    case 'instance-clear':
      return { Icon: InstanceIcon, move: 'clear', tooltip: 'Instance partie' };
    case 'component-set':
      return { Icon: ComponentIcon, move: 'set', tooltip: 'Componsant arrivé' };
    case 'component-clear':
      return { Icon: ComponentIcon, move: 'clear', tooltip: 'Componsant parti' };
    case 'state-set':
      return { Icon: StateIcon, move: 'none', tooltip: 'État changé' };
  }
}

function useItem(id: string) {
  return useSelector((appState: AppState) => getItem(appState, id));
}
