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
import { useTemplateInstanceState, useGetExistingTemplateInstanceNames } from '../view-state';
import { useSnapValue } from '../snap';
import { AppState } from '../../../../../store/types';
import { getTemplateInstance } from '../../../../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-template-instance' });

// A templateInstance can be selected before it actually exists, let's be safe

const PropertiesTemplateInstance: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const templateInstance = useSelector((state: AppState) => getTemplateInstance(state, id));

  if (templateInstance) {
    return <UnsafePropertiesTemplateInstance className={className} id={id} />;
  } else {
    return  <div className={className} />;
  }
};

export default PropertiesTemplateInstance;

const UnsafePropertiesTemplateInstance: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const classes = useStyles();
  const { templateInstance, update, duplicate, rename, remove } = useTemplateInstanceState(id);
  const getExistingTemplateInstanceNames = useGetExistingTemplateInstanceNames();
  const snap = useSnapValue();
  const fireAsync = useFireAsync();
  const existingNames = useMemo(() => Array.from(getExistingTemplateInstanceNames()), [getExistingTemplateInstanceNames]);
  const showRenameDialog = useRenameDialog(existingNames, templateInstance.templateInstanceId, 'Entrer un nom d\'instance de template');

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
          <ReadonlyStringEditor value={templateInstance.templateInstanceId} />
        </Item>
        <Item title={'X'}>
          <SnappedIntegerEditor snap={snap} value={templateInstance.x} onChange={(value) => update({ x: value })} />
        </Item>
        <Item title={'Y'}>
          <SnappedIntegerEditor snap={snap} value={templateInstance.y} onChange={(value) => update({ y: value })} />
        </Item>
      </Group>
    </div>
  );
};
