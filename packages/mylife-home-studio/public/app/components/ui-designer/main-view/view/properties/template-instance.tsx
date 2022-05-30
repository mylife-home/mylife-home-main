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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent';

import { TransitionProps } from '../../../../dialogs/common';
import { ActionIcon, StateIcon } from '../../../../lib/icons';
import DeleteButton from '../../../../lib/delete-button';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import { useTabPanelId, TabIdContext } from '../../../../lib/tab-panel';
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
import { getComponentsMap, getTemplateInstance, makeGetComponentsAndPlugins } from '../../../../../store/ui-designer/selectors';

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
  const { templateInstance, template, move, setTemplate, setBindings, duplicate, rename, remove } = useTemplateInstanceState(id);
  const getExistingTemplateInstanceNames = useGetExistingTemplateInstanceNames();
  const snap = useSnapValue();
  const fireAsync = useFireAsync();
  const existingNames = useMemo(() => Array.from(getExistingTemplateInstanceNames()), [getExistingTemplateInstanceNames]);
  const showRenameDialog = useRenameDialog(existingNames, templateInstance.templateInstanceId, 'Entrer un nom d\'instance de template');
  const exportIds = useMemo(() => Object.keys(template.exports).sort(), [template.exports]);
  const canUseBulkPattern = useMemo(() => Object.values(template.exports).some(item => item.bulkPattern), [template.exports]);
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
        {canUseBulkPattern && (
          <Tooltip title="Gérer l'association de bindings à l'aide de pattern">
            <IconButton onClick={handleBulkPatternClick}>
              <SettingsInputComponentIcon />
            </IconButton>
          </Tooltip>
        )}
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
  const tabId = useTabPanelId();
  const [exportData, setExportData] = useState<{ [exportId: string]: UiTemplateExport; }>();
  const [onResult, setOnResult] = useState<(result: DialogResult) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    return (
      <TabIdContext.Provider value={tabId}>
        <BulkPatternDialog open={open} hideModal={hideModal} onExited={onExited} exportData={exportData} onResult={onResult} />
      </TabIdContext.Provider>
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
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: 500,
    maxHeight: 500,
    padding: 0
  },
  leftPane: {
    width: 400,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
  },
  pattern: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  bindings: {
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
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
  list: {
    overflowY: 'auto',
    width: 300
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    marginRight: theme.spacing(1)
  },
  listItemValue: {
    width: 200
  },
  listItemType: {
    width: 100
  }
}), { name: 'properties-template-instance-bulk-pattern-dialog' });

interface BulkPatternDialogProps {
  open: boolean;
  hideModal: () => void;
  onExited: () => void;
  exportData: { [exportId: string]: UiTemplateExport; };
  onResult: (result: DialogResult) => void;
}

const BulkPatternDialog: FunctionComponent<BulkPatternDialogProps> = ({ open, hideModal, onExited, exportData, onResult }) => {
  const classes = useDialogStyles();
  const [pattern, setPattern] = useState<string>('');
  const componentData = useComponentData();
  const bindings = useBindingsMatcher(componentData, exportData, pattern);
  const filteredComponentData = useMemo(() => componentData.filter(({ value }) => value.includes(pattern)), [componentData, pattern]);

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
    <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} maxWidth={false}>
      <DialogTitle id="dialog-title">Pattern de sélection de bindings</DialogTitle>
    
      <DialogContent dividers className={classes.container}>
        <div className={classes.leftPane}>
          <TextField
            className={classes.pattern}
            variant="outlined"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            fullWidth
            helperText="Pattern"
            autoFocus
          />

          <BindingList exportData={exportData} bindings={bindings} />
        </div>

        <ComponentList componentData={filteredComponentData} onClick={setPattern} />
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
  const componentMap = useSelector(getComponentsMap);
  const exportIds = useMemo(() => Object.entries(exportData).filter(([, value]) => value.bulkPattern).map(([key]) => key).sort(), [exportData]);

  return (
    <div className={classes.bindings}>
      {exportIds.map(exportId => {
        const { memberType, valueType, bulkPattern } = exportData[exportId];
        const Icon = getMemberIcon(memberType);
        const binding = bindings[exportId];
        const value = binding?.memberName ? `${componentMap[binding.componentId].componentId}.${binding.memberName}` : '';

        return (
          <div key={exportId} className={classes.binding}>
            <Icon className={classes.bindingIcon} />
            <Typography className={classes.bindingId}>{exportId}</Typography>
            <Typography className={classes.bindingType} variant="overline">{valueType}</Typography>
            <TextField className={classes.bindingValue} InputProps={{ readOnly: true }} variant="outlined" placeholder={bulkPattern} value={value} />
          </div>
        );
      })}
    </ div>
  );
};

const ComponentList: FunctionComponent<{ componentData: ComponentData; onClick: (value: string) => void; }> = ({ componentData, onClick }) => {
  const classes = useDialogStyles();
  return (
    <List className={classes.list} dense>
      {componentData.slice(0, 20).map(component => {
        const Icon = getMemberIcon(component.memberType);
        return (
          <ListItem key={component.value} button className={classes.listItem} onClick={() => onClick(component.value)}>
            <Icon className={classes.listItemIcon} />
            <Typography className={classes.listItemValue}>{component.value}</Typography>
            <Typography className={classes.listItemType} variant="overline">{component.valueType}</Typography>
          </ListItem>
        );
      })}
    </List>
  );
}

function getMemberIcon(memberType: MemberType) {
  switch (memberType) {
    case MemberType.STATE:
      return StateIcon;
    case MemberType.ACTION:
      return ActionIcon;
  }
}

type ComponentData = { value: string; componentId: string; memberName: string, memberType: MemberType, valueType: string }[];

function useComponentData() {
  const getComponentsAndPlugins = useMemo(() => makeGetComponentsAndPlugins(), []);
  const componentsAndPlugins = useTabSelector(getComponentsAndPlugins);

  return useMemo(() => {
    const list: ComponentData = [];

    for (const { component, plugin } of componentsAndPlugins) {
      for (const [memberName, member] of Object.entries(plugin.members)) {
        list.push({
          value: `${component.componentId}.${memberName}`,
          componentId: component.id,
          memberName,
          memberType: member.memberType,
          valueType: member.valueType
        });
      }
    }

    return list;
  }, [componentsAndPlugins]);
}

function useBindingsMatcher(componentData: ComponentData, exportData: { [exportId: string]: UiTemplateExport; }, pattern: string) {
  const componentsByValue = useMemo(() => {
    const components: { [value: string]: typeof componentData[number] } = {};

    for (const item of componentData) {
      components[item.value] = item;
    }

    return components;

  }, [componentData]);
  
  return useMemo(() => {
    const bindings: { [exportId: string]: UiTemplateInstanceBinding } = {};

    for (const [exportId, { memberType, valueType, bulkPattern }] of Object.entries(exportData)) {
      if (!bulkPattern) {
        continue;
      }

      bindings[exportId] = { componentId: null, memberName: null };

      // Try to find match
      const value = bulkPattern.replace('{{pattern}}', pattern);
      const candidate = componentsByValue[value];

      if (candidate && candidate.memberType === memberType && candidate.valueType === valueType) {
        bindings[exportId].componentId = candidate.componentId;
        bindings[exportId].memberName = candidate.memberName;
      }
    }
  
    return bindings;
  }, [componentsByValue, exportData, pattern]);
}
