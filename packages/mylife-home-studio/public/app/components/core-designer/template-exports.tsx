import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import SvgIcon from '@material-ui/core/SvgIcon';
import AddIcon from '@material-ui/icons/Add';

import { StateIcon, ActionIcon } from '../lib/icons';
import { Group, Item } from '../lib/properties-layout';
import { useTabSelector } from '../lib/use-tab-selector';
import DeleteButton from '../lib/delete-button';
import { AppState } from '../../store/types';
import { MemberType } from '../../store/core-designer/types';
import { getActiveTemplateId, getTemplate, getComponent, getPlugin, PropertyItem, getTemplateCandidateConfigExports, getTemplateCandidateMemberExports, getTemplateConfigItem, getTemplateMemberItem } from '../../store/core-designer/selectors';
import { setTemplateExport, clearTemplateExport } from '../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.success.main,
  },
  target: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  targetLabel: {
    display: 'flex',
  },
  titleIcon: {
    marginRight: theme.spacing(1),
  },
  targetText: {
    flex: 1
  },
  targetType: {

  }
}), { name: 'template-exports' });

const TemplateExports: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const template = useActiveTemplate();
  const configIds = useMemo(() => Object.keys(template.exports.config).sort(), [template]);
  const memberIds = useMemo(() => Object.keys(template.exports.members).sort(), [template]);
  const configList = useSelector((state: AppState) => getTemplateCandidateConfigExports(state, template.id));
  const memberList = useSelector((state: AppState) => getTemplateCandidateMemberExports(state, template.id));

  return (
    <div className={className}>
      <Group title="Configuration">
        {configIds.map(id => (<ConfigItem key={id} id={id} />))}

        <NewItem existingIds={configIds} propertyList={configList} exportType='config' />
      </Group>

      <Group title="Membres">
        {memberIds.map(id => (<MemberItem key={id} id={id} />))}

        <NewItem existingIds={memberIds} propertyList={memberList} exportType='member' />
      </Group>

    </div>
  );
};

export default TemplateExports;

const ConfigItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const template = useActiveTemplate();
  const configItem = template.exports.config[id];
  const component = useSelector((state: AppState) => getComponent(state, id));
  const configMeta = useSelector((state: AppState) => getTemplateConfigItem(state, template.id, id));

  return (
    <ExportItem
      id={id}
      description={configMeta.description}
      text={`${component.componentId}.${configItem.configName}`}
      type={configMeta.valueType}
      exportType='config'
    />
  );
};

const MemberItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const template = useActiveTemplate();
  const member = template.exports.members[id];
  const component = useSelector((state: AppState) => getComponent(state, id));
  const memberMeta = useSelector((state: AppState) => getTemplateMemberItem(state, template.id, id));
  const MemberIcon = getMemberIcon(memberMeta.memberType);

  return (
    <ExportItem
      id={id}
      description={memberMeta.description}
      icon={MemberIcon}
      text={`${component.componentId}.${member.member}`}
      type={memberMeta.valueType}
      exportType='member'
    />
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

const ExportItem: FunctionComponent<{ id: string; description: string; icon?: typeof SvgIcon; text: string; type: string; exportType: 'config' | 'member'; }> = ({ id, description, icon, text, type, exportType }) => {
  const classes = useStyles();
  const Icon = icon;
  const clear = useClearExport(exportType, id);

  return (
    <Item title={
      <>
        {Icon && <Icon className={classes.titleIcon} />}
        {id}
      </>
    }>
      <Tooltip title={description || ''}>
        <div className={clsx(classes.target, classes.targetLabel)}>
          <Typography className={classes.targetText}>
            {text}
          </Typography>

          <Typography variant="overline" className={classes.targetType}>
            {type}
          </Typography>
        </div>
      </Tooltip>

      <DeleteButton icon tooltip="Supprimer" onConfirmed={clear} />
    </Item>
  );
};

const NewItem: FunctionComponent<{ existingIds: string[]; propertyList: PropertyItem[]; exportType: 'config' | 'member'; }> = ({ existingIds, propertyList, exportType }) => {
  const classes = useStyles();
  const [id, setId] = useState<string>('');
  const [property, setProperty] = useState<PropertyItem>(null);
  const { valid, reason } = useMemo(() => validateId(id, existingIds), [id, existingIds]);
  const dispatch = useDispatch();

  const onNewClick = useCallback(() => {
    dispatch(setTemplateExport({ exportType, exportId: id, componentId: property.componentId, propertyName: property.propertyName }));
    setProperty(null);
    setId('');
  }, [dispatch, exportType, id, property, setProperty, setId]);

  return (
    <Item title={<TextField fullWidth value={id} onChange={(e) => setId(e.target.value)} error={!!reason} helperText={reason} />} noTitleTypography>
      
      <PropertySelector className={classes.target} list={propertyList} value={property} onSelect={setProperty} />

      <IconButton className={classes.button} onClick={onNewClick} disabled={!valid || !id}>
        <AddIcon />
      </IconButton>

    </Item>
  );
};

function validateId(value: string, existingIds: string[]): { valid: boolean, reason?: string } {
  if (!value) {
    return { valid: false };
  }

  if (existingIds.includes(value)) {
    return { valid: false, reason: 'Ce nom existe déjà' };
  }

  return { valid: true };
}

const PropertySelector: FunctionComponent<{ className?: string; list: PropertyItem[]; value: PropertyItem; onSelect: (value: PropertyItem) => void; }> = ({ className, list, value, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={value}
      onChange={(event, newValue: PropertyItem) => {
        onSelect(newValue);
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={list}
      getOptionLabel={(option: PropertyItem) => `${option.componentName}.${option.propertyName}`}
      getOptionSelected={getOptionSelected}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

function getOptionSelected(option: PropertyItem, value: PropertyItem) {
  if (!option && !value) {
    return true;
  }

  if (!option || !value) {
    return false;
  }

  return option.componentId === value.componentId && option.propertyName === value.propertyName;
}

function useActiveTemplate() {
  const templateId = useTabSelector(getActiveTemplateId);
  return useSelector((state: AppState) => getTemplate(state, templateId));
}

function useClearExport(exportType: 'config' | 'member', exportId: string) {
  const templateId = useTabSelector(getActiveTemplateId);
  const dispatch = useDispatch();

  return useCallback(() => {

    // TODO: check usage

    dispatch(clearTemplateExport({ templateId, exportType, exportId }))
  }, [dispatch, templateId, exportType, exportId]);
}
