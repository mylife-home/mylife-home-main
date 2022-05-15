import React, { FunctionComponent, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import DeleteButton from '../../../../lib/delete-button';
import { useFireAsync } from '../../../../lib/use-error-handling';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import { useRenameDialog } from '../../../../dialogs/rename';
import { Group, Item } from '../../../../lib/properties-layout';
import { WindowIcon, TemplateIcon } from '../../../../lib/icons';
import SnappedIntegerEditor from '../../common/snapped-integer-editor';
import ReadonlyStringEditor from '../../common/readonly-string-editor';
import StyleSelector from '../../common/style-selector';
import { useControlState, useControlDuplicate, useGetExistingControlNames, useViewType, useViewId } from '../view-state';
import { useSnapValue } from '../snap';
import PropertiesControlAppearence from './control-appearence';
import PropertiesControlActions from './control-actions';
import { AppState } from '../../../../../store/types';
import { getControl, getWindowsIds, getTemplatesIds, getView } from '../../../../../store/ui-designer/selectors';
import { UiViewType, UiWindow, UiTemplate } from '../../../../../store/ui-designer/types';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
  duplicateSelfViewItem: {
    fontWeight: 'bold',
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
  const { control, update, rename, remove } = useControlState(id);
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
          <DuplicateButton id={id} />

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

const DuplicateButton: FunctionComponent<{ id: string }> = ({ id }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
  const views = useViewList();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Dupliquer">
        <IconButton onClick={handleClick}>
          <FileCopyIcon />
        </IconButton>
      </Tooltip>

      <Menu
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
      >
        <ListSubheader>
          {`Vue où créer le contrôle dupliqué`}
        </ListSubheader>
        {views.map(({ viewType, viewId }, index) => (
          <DuplicateMenuItem key={`${viewType}:${viewId}`} id={id} viewType={viewType} viewId={viewId} isSelf={index === 0} onClose={handleClose} />
        ))}
      </Menu>
    </>
  );
};

const DuplicateMenuItem: FunctionComponent<{ id: string; viewType: UiViewType; viewId: string; isSelf: boolean; onClose: () => void; }> = ({ id, viewType, viewId, isSelf, onClose }) => {
  const classes = useStyles();
  const duplicate = useControlDuplicate(id, viewType, viewId);
  const view = useSelector((state: AppState) => getView(state, viewType, viewId));

  const handleClick = () => {
    onClose();
    duplicate();
  };

  const textClasses = isSelf ? classes.duplicateSelfViewItem : null;

  return (
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
        {viewType === 'window' && (
          <WindowIcon />
        )}

        {viewType === 'template' && (
          <TemplateIcon />
        )}
      </ListItemIcon>

      <ListItemText primaryTypographyProps={{ className: textClasses }}>
        {viewType === 'window' && (view as UiWindow).windowId}
        {viewType === 'template' && (view as UiTemplate).templateId}
      </ListItemText>
    </MenuItem>
  );
};

// first item is always self
function useViewList() {
  const currentViewType = useViewType();
  const currentViewId = useViewId();
  const windowsIds = useTabSelector(getWindowsIds);
  const templatesIds = useTabSelector(getTemplatesIds);

  return useMemo(() => {
    const list = [{ viewType: currentViewType, viewId: currentViewId }];

    for (const viewId of windowsIds) {
      if (currentViewType !== 'window' || currentViewId !== viewId) {
        list.push({ viewType: 'window', viewId });
      }
    }

    for (const viewId of templatesIds) {
      if (currentViewType !== 'template' || currentViewId !== viewId) {
        list.push({ viewType: 'template', viewId });
      }
    }

    return list;

  }, [currentViewType, currentViewId, windowsIds, templatesIds]);
}