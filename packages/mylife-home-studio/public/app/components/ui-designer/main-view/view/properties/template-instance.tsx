import React, { FunctionComponent, useMemo } from 'react';
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
import TemplateSelector from '../../common/template-selector';
import ComponentMemberSelector from '../../common/component-member-selector';
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
  const { templateInstance, template, move, setTemplate, setBinding, duplicate, rename, remove } = useTemplateInstanceState(id);
  const getExistingTemplateInstanceNames = useGetExistingTemplateInstanceNames();
  const snap = useSnapValue();
  const fireAsync = useFireAsync();
  const existingNames = useMemo(() => Array.from(getExistingTemplateInstanceNames()), [getExistingTemplateInstanceNames]);
  const showRenameDialog = useRenameDialog(existingNames, templateInstance.templateInstanceId, 'Entrer un nom d\'instance de template');
  const exportIds = useMemo(() => Object.keys(template.exports).sort(), [template.exports]);

  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        rename(newName);
      }
    });

  return (
    <div className={className}>
      <Group title={'Instance de template'}>
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
        <Item title={'Template'}>
          <TemplateSelector value={templateInstance.templateId} onChange={(value) => setTemplate(value)} />
        </Item>
        <Item title={'X'}>
          <SnappedIntegerEditor snap={snap} value={templateInstance.x} onChange={(value) => move(value, undefined)} />
        </Item>
        <Item title={'Y'}>
          <SnappedIntegerEditor snap={snap} value={templateInstance.y} onChange={(value) => move(undefined, value)} />
        </Item>
      </Group>

      <Group title={'Bindings'}>
        {exportIds.map(exportId => (
          <Binding key={exportId} id={id} exportId={exportId} />
        ))}
      </Group>
    </div>
  );
};

const Binding: FunctionComponent<{ id: string; exportId: string; }> = ({ id, exportId }) => {
  const { templateInstance, template, setBinding } = useTemplateInstanceState(id);
  const exportData = template.exports[exportId];
  const binding = templateInstance.bindings[exportId];

  return (
    <Item title={exportId}>
      <ComponentMemberSelector
        memberType={exportData.memberType}
        filter={(name, member) => member.valueType === exportData.valueType}
        value={{ component: binding.componentId, member: binding.memberName }}
        onChange={(value) => setBinding(exportId, value.component, value.member)}
      />
    </Item>
  );
};
