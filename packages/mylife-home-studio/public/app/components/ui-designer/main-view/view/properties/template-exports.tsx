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

import { StateIcon, ActionIcon } from '../../../../lib/icons';
import { Group, Item } from '../../../../lib/properties-layout';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import DeleteButton from '../../../../lib/delete-button';
import { AppState } from '../../../../../store/types';
import { MemberType } from '../../../../../store/ui-designer/types';
import { MemberItem, makeGetTemplateCandidateExports } from '../../../../../store/ui-designer/selectors';
import { setTemplateExport, clearTemplateExport } from '../../../../../store/ui-designer/actions';
import { useTemplateState } from '../view-state';

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

const TemplateExports: FunctionComponent = () => {
  const { template } = useTemplateState();
  const exportIds = useMemo(() => Object.keys(template.exports).sort(), [template.exports]);

  return (
    <Group title="Exports">
      {exportIds.map(id => (<ExportItem key={id} id={id} />))}

      <NewItem />
    </Group>
  );
};

export default TemplateExports;

const ExportItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const classes = useStyles();
  const { template, clearExport } = useTemplateState();
  const { memberType, valueType } = template.exports[id];
  const Icon = getMemberIcon(memberType);

  return (
    <Item title={
      <>
        {Icon && <Icon className={classes.titleIcon} />}
        {id}
      </>
    }>
      <div className={clsx(classes.target, classes.targetLabel)}>
        <Typography variant="overline" className={classes.targetType}>
          {valueType}
        </Typography>
      </div>

      <DeleteButton icon tooltip="Supprimer" onConfirmed={() => clearExport(id)} />
    </Item>
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

const NewItem: FunctionComponent = () => {
  const classes = useStyles();
  const { template, setExport } = useTemplateState();
  const existingIds = useMemo(() => Object.keys(template.exports).sort(), [template.exports]);
  const getTemplateCandidateExports = useMemo(() => makeGetTemplateCandidateExports(), []);
  const candidates = useTabSelector(getTemplateCandidateExports);
  const [id, setId] = useState<string>('');
  const [member, setMember] = useState<MemberItem>(null);
  const { valid, reason } = useMemo(() => validateId(id, existingIds), [id, existingIds]);

  const onNewClick = useCallback(() => {
    setExport(id, member.memberType, member.valueType);
    setMember(null);
    setId('');
  }, [setExport, id, setId, member, setMember]);

  return (
    <Item title={<TextField fullWidth value={id} onChange={(e) => setId(e.target.value)} error={!!reason} helperText={reason} />} noTitleTypography>
      
      <MemberSelector className={classes.target} list={candidates} value={member} onSelect={setMember} />

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

const MemberSelector: FunctionComponent<{ className?: string; list: MemberItem[]; value: MemberItem; onSelect: (value: MemberItem) => void; }> = ({ className, list, value, onSelect }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      className={className}
      value={value}
      onChange={(event, newValue: MemberItem) => {
        onSelect(newValue);
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={list}
      getOptionLabel={(option: MemberItem) => `${option.memberType} - ${option.valueType}`}
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

function getOptionSelected(option: MemberItem, value: MemberItem) {
  if (!option && !value) {
    return true;
  }

  if (!option || !value) {
    return false;
  }

  return option.memberType === value.memberType && option.valueType === value.valueType;
}
