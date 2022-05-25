import React, { FunctionComponent, useMemo, useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useModal } from 'react-modal-hook';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent';

import { TransitionProps } from '../../../../dialogs/common';
import { ActionIcon, StateIcon } from '../../../../lib/icons';
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
import { MemberType, UiTemplateExport, UiTemplateInstanceBinding } from '../../../../../store/ui-designer/types';
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
  const { templateInstance, template, move, setTemplate, setBindings, setBinding, duplicate, rename, remove } = useTemplateInstanceState(id);
  const getExistingTemplateInstanceNames = useGetExistingTemplateInstanceNames();
  const snap = useSnapValue();
  const fireAsync = useFireAsync();
  const existingNames = useMemo(() => Array.from(getExistingTemplateInstanceNames()), [getExistingTemplateInstanceNames]);
  const showRenameDialog = useRenameDialog(existingNames, templateInstance.templateInstanceId, 'Entrer un nom d\'instance de template');
  const exportIds = useMemo(() => Object.keys(template.exports).sort(), [template.exports]);
  const showBulkPatternEditor = useBulkPatternEditor();

  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        rename(newName);
      }
    });

  const handleBulkPatternClick = () => 
  fireAsync(async () => {
    const { status, bindings } = await showBulkPatternEditor(template.exports);
    if (status === 'ok') {
      setBindings(bindings);
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

      <Group title={
      <>
        Bindings
        <Tooltip title="Gérer l'association de bindings à l'aide de pattern">
          <IconButton onClick={handleBulkPatternClick}>
            <SettingsInputComponentIcon />
          </IconButton>
        </Tooltip>
      </>
    }>
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

type DialogResult = { status: 'ok' | 'cancel'; bindings?: { [bindingId: string]: UiTemplateInstanceBinding; } };

function useBulkPatternEditor() {
  const [exportData, setExportData] = useState<{ [exportId: string]: UiTemplateExport; }>();
  const [onResult, setOnResult] = useState<(result: DialogResult) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    return (
      <BulkPatternDialog open={open} hideModal={hideModal} onExited={onExited} exportData={exportData} onResult={onResult} />
    );
  }, [exportData, onResult]);

  return useCallback((exportData: { [exportId: string]: UiTemplateExport; }) => new Promise<DialogResult>(resolve => {
    setExportData(exportData);

    // else useState think resolve is a state updater
    setOnResult(() => resolve);

    showModal();
  }), [setExportData, setOnResult, showModal]);
}

const useDialogStyles = makeStyles((theme) => ({
  bindings: {
    display: 'flex',
    flexDirection: 'column',
  },
  binding: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bindingIcon: {
    marginRight: theme.spacing(1)
  },
  bindingId: {
    width: 100
  },
  bindingType: {
    width: 100
  },
  bindingValue: {
    width: 200
  },
}), { name: 'properties-template-instance-bulk-pattern-dialog' });

interface BulkPatternDialogProps {
  open: boolean;
  hideModal: () => void;
  onExited: () => void;
  exportData: { [exportId: string]: UiTemplateExport; };
  onResult: (result: DialogResult) => void;
}

const BulkPatternDialog: FunctionComponent<BulkPatternDialogProps> = ({ open, hideModal, onExited, exportData, onResult }) => {
  const [pattern, setPattern] = useState<string>('');
  const [bindings, setBindings] = useState<{ [bindingId: string]: UiTemplateInstanceBinding; }>({});
  // TODO: components

  useEffect(() => {
    const values: typeof bindings = {};
    for(const exportId of Object.keys(exportData)) {
      values[exportId] = { componentId: null, memberName: null };
    }

    setBindings(values);
  }, [exportData]);

  const setBinding = useCallback((exportId: string, componentId: string, memberName: string) => setBindings(bindings => ({ ...bindings, [exportId]: { componentId, memberName } })), [setBindings]);

  const cancel = () => {
    hideModal();
    onResult({ status: 'cancel' });
  };

  const validate = () => {
    hideModal();

    // Do not reset unmatched bindings
    const newBindings: typeof bindings = {};
    for (const [exportId, bindingData] of Object.entries(bindings)) {
      if (bindingData.memberName) {
        newBindings[exportId] = bindingData;
      }
    }

    onResult({ status: 'ok', bindings: newBindings });
  };

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel}>
      <DialogTitle id="dialog-title">Pattern de sélection de bindings</DialogTitle>
    
      <DialogContent dividers>

        <TextField
          variant="outlined"
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          fullWidth
        />

        <BindingList exportData={exportData} bindings={bindings} />


      </DialogContent>
    
      <DialogActions>
        <Button color="primary" onClick={validate}>OK</Button>
        <Button onClick={cancel}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
};

interface BindingListProps {
  exportData: { [exportId: string]: UiTemplateExport; };
  bindings: { [bindingId: string]: UiTemplateInstanceBinding; };
}

const BindingList: FunctionComponent<BindingListProps> = ({ exportData, bindings }) => {
  const classes = useDialogStyles();
  return (
    <div className={classes.bindings}>
      {Object.keys(exportData).sort().map(exportId => {
        const { memberType, valueType, bulkPattern } = exportData[exportId];
        const Icon = getMemberIcon(memberType);
        const binding = bindings[exportId];
        const value = binding?.memberName ? `${binding.componentId}.${binding.memberName}` : '';

        return (
          <div key={exportId} className={classes.binding}>
            <Icon className={classes.bindingIcon} />
            <Typography className={classes.bindingId}>{exportId}</Typography>
            <Typography className={classes.bindingType} variant="overline">{valueType}</Typography>
            <TextField className={classes.bindingValue} disabled variant="outlined" placeholder={bulkPattern} value={value} />
          </div>
        );
      })}
    </ div>
  );
};

function getMemberIcon(memberType: MemberType) {
  switch (memberType) {
    case MemberType.STATE:
      return StateIcon;
    case MemberType.ACTION:
      return ActionIcon;
  }
}
