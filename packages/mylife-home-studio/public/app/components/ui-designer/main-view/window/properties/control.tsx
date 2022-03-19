import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import DeleteButton from '../../../../lib/delete-button';
import { useFireAsync } from '../../../../lib/use-error-handling';
import { useRenameDialog } from '../../../../dialogs/rename';
import { Group, Item } from '../../../../lib/properties-layout';
import SnappedIntegerEditor from '../../common/snapped-integer-editor';
import ReadonlyStringEditor from '../../common/readonly-string-editor';
import { useControlState, useWindowState, useGetExistingControlNames } from '../window-state';
import { useSnapValue } from '../snap';
import PropertiesControlAppearence from './control-appearence';
import PropertiesControlActions from './control-actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-control' });

const PropertiesControl: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const classes = useStyles();
  const { control, update, duplicate, remove } = useControlState(id);
  const { window } = useWindowState();
  const getExistingControlNames = useGetExistingControlNames();
  const snap = useSnapValue();
  const fireAsync = useFireAsync();
  const existingNames = useMemo(() => Array.from(getExistingControlNames()), [getExistingControlNames]);
  const showRenameDialog = useRenameDialog(existingNames, id, 'Entrer un nom de contrôle');

  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        update({ id: newName });
      }
    });

  return (
    <div className={className}>
      <Group title={'Contrôle'}>
        <div className={classes.actions}>
          <Tooltip title="Dupliquer">
            <IconButton onClick={duplicate}>
              <FileCopyIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Renommer">
            <IconButton onClick={onRename}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <DeleteButton icon tooltip="Supprimer" onConfirmed={remove} />
        </div>

        <Item title={'Identifiant'}>
          <ReadonlyStringEditor value={control.id} />
        </Item>
        <Item title={'X'}>
          <SnappedIntegerEditor snap={snap} value={control.x} onChange={(value) => update({ x: value })} />
        </Item>
        <Item title={'Y'}>
          <SnappedIntegerEditor snap={snap} value={control.y} onChange={(value) => update({ y: value })} />
        </Item>
        <Item title={'Largeur'}>
          <SnappedIntegerEditor snap={snap} value={control.width} onChange={(value) => update({ width: value })} />
        </Item>
        <Item title={'Longueur'}>
          <SnappedIntegerEditor snap={snap} value={control.height} onChange={(value) => update({ height: value })} />
        </Item>
      </Group>

      <PropertiesControlAppearence id={id} />
      <PropertiesControlActions id={id} />
    </div>
  );
};

export default PropertiesControl;
