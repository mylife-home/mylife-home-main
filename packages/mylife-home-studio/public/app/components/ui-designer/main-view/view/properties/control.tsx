import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
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
import StyleSelector from '../../common/style-selector';
import { useControlState, useGetExistingControlNames } from '../view-state';
import { useSnapValue } from '../snap';
import PropertiesControlAppearence from './control-appearence';
import PropertiesControlActions from './control-actions';
import { AppState } from '../../../../../store/types';
import { getControl } from '../../../../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-control' });

// A control can be selected before it actually exists, let's be safe

const PropertiesControl: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const control = useSelector((state: AppState) => getControl(state, id));

  if (control) {
    return <UnsafePropertiesControl className={className} id={id} />;
  } else {
    return  <div className={className} />;
  }
};

export default PropertiesControl;

const UnsafePropertiesControl: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const classes = useStyles();
  const { control, update, duplicate, rename, remove } = useControlState(id);
  const getExistingControlNames = useGetExistingControlNames();
  const snap = useSnapValue();
  const fireAsync = useFireAsync();
  const existingNames = useMemo(() => Array.from(getExistingControlNames()), [getExistingControlNames]);
  const showRenameDialog = useRenameDialog(existingNames, control.controlId, 'Entrer un nom de contrôle');

  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        rename(newName);
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
          <ReadonlyStringEditor value={control.controlId} />
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
        <Item title={'Style'} multiline>
          <StyleSelector value={control.style} onChange={(value) => update({ style: value })} />
        </Item>
      </Group>

      <PropertiesControlAppearence id={id} />
      <PropertiesControlActions id={id} />
    </div>
  );
};
