import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import DeleteButton from '../../lib/delete-button';
import { useTabPanelId } from '../../lib/tab-panel';
import { Point } from '../drawing/types';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { useSelection } from '../selection';
import CenterButton from './center-button';
import { Group, Item } from '../../lib/properties-layout';

import { AppState } from '../../../store/types';
import * as types from '../../../store/core-designer/types';
import { getComponent, getPlugin, getBinding } from '../../../store/core-designer/selectors';
import { clearBinding } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-multiple' });

const Multiple: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const { selectedComponents, select } = useSelection();
  const ids = useMemo(() => Object.keys(selectedComponents).sort(), [selectedComponents]);

  // TODO
  const centerPosition = { x: 0, y: 0 };

  const clearAll = () => {
    console.log('TODO delete all component');
  };

  return (
    <div className={className}>
      <Group title="Sélection multiple">
        <div className={classes.actions}>
          <CenterButton position={centerPosition} />
          <DeleteButton icon tooltip="Supprimer tous les composants" confirmText="Êtes-vous sûr de vouloir supprimer tous les composants ?" onConfirmed={clearAll} />
        </div>

        <Item title="Composants" multiline>
          {ids.map(id => (
            <Link key={id} variant="body1" color="textPrimary" href="#" onClick={() => select({ type: 'component', id})}>{id}</Link>
          ))}
        </Item>
      </Group>
    </div>
  );
};

export default Multiple;
