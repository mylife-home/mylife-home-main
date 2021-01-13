import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import DeleteButton from '../../../lib/delete-button';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useInputDialog } from '../../../dialogs/input';
import { Group, Item } from '../common/properties-layout';
import SnappedIntegerEditor from '../common/snapped-integer-editor';
import ResourceSelector from '../common/resource-selector';
import WindowSelector from '../common/window-selector';
import ReadonlyStringEditor from '../common/readonly-string-editor';
import { useControlState, useWindowState } from './window-state';
import { useSnapValue } from './snap';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  }
}));

const PropertiesControl: FunctionComponent<{ className?: string; id: string; }> = ({ className, id }) => {
  const classes = useStyles();
  const { control, update, duplicate, remove } = useControlState(id);
  const snap = useSnapValue();
  const fireAsync = useFireAsync();
  const showNewNameDialog = useNewNameDialog();

  const onRename = () =>
    fireAsync(async () => {
      const { status, id: newId } = await showNewNameDialog(id);
      if (status === 'ok') {
        update({ id: newId });
      }
    });

  return (
    <div className={className}>
      <Group title={"Contrôle"}>
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

        <Item title={"Identifiant"}>
          <ReadonlyStringEditor value={control.id} />
        </Item>
        <Item title={"X"}>
          <SnappedIntegerEditor snap={snap} value={control.x} onChange={value => update({ x: value })} />
        </Item>
        <Item title={"Y"}>
          <SnappedIntegerEditor snap={snap} value={control.y} onChange={value => update({ y: value })} />
        </Item>
        <Item title={"Largeur"}>
          <SnappedIntegerEditor snap={snap} value={control.width} onChange={value => update({ width: value })} />
        </Item>
        <Item title={"Longueur"}>
          <SnappedIntegerEditor snap={snap} value={control.height} onChange={value => update({ height: value })} />
        </Item>
      </Group>
    </div>
  );
};

export default PropertiesControl;

function useNewNameDialog() {
  const showDialog = useInputDialog();
  const { window } = useWindowState();

  return async (initialId: string = null) => {
    const controlIds = new Set(window.controls.map(control => control.id));
    const options = {
      title: 'Nouveau nom',
      message: 'Entrer un nom de contrôle',
      initialText: initialId,
      validator(newId: string) {
        if (!newId) {
          return 'Nom vide';
        }
        if (newId === initialId) {
          return;
        }
        if (controlIds.has(newId)) {
          return 'Ce nom existe déjà';
        }
      }
    };

    const { status, text: id } = await showDialog(options);
    return { status, id };
  };
}
