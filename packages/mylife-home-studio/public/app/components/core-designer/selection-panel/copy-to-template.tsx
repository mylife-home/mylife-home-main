import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { useFireAsync } from '../../lib/use-error-handling';
import { useTabSelector } from '../../lib/use-tab-selector';
import { useSnackbar } from '../../dialogs/snackbar';
import { AsyncDispatch } from '../../../store/types';
import { CopyComponentsStats } from '../../../store/core-designer/types';
import { getComponentsMap, getTemplatesMap, getTemplateIds } from '../../../store/core-designer/selectors';
import { copyComponentsToTemplate } from '../../../store/core-designer/actions';

interface CopyToTemplateButtonProps {
  componentsIds: string[];
}

const CopyToTemplateButton: FunctionComponent<CopyToTemplateButtonProps> = ({ componentsIds }) => {
  const componentsMap = useSelector(getComponentsMap);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const disabled = useMemo(() => {
    for (const id of componentsIds) {
      const component = componentsMap[id];
      if (component.definition.type === 'template' || component.external) {
        return true;
      }
    }

    return false;
  }, [componentsIds, componentsMap]);

  return (
    <>
      <Tooltip title="Copier les composants sélectionnés dans un template">
        <IconButton onClick={handleClick} disabled={disabled}>
          <FileCopyIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <TemplateSelectorPopoverContent componentsIds={componentsIds} onClose={handleClose} />
      </Popover>
    </>
  );
};

const useTemplateSelectorStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  selector: {
    width: 300
  }
}), { name: 'properties-component-new-binding' });

const TemplateSelectorPopoverContent: FunctionComponent<{ componentsIds: string[]; onClose: () => void; }> = ({ componentsIds, onClose }) => {
  const classes = useTemplateSelectorStyles();
  const list = useTabSelector((state, tabId) => getTemplateIds(state, tabId));
  const copyToTemplate = useCopyToTemplate();

  const onSelect = (templateId: string) => {
    copyToTemplate(componentsIds, templateId);
    onClose();
  };

  return (
    <div className={classes.container}>
      <TemplateSelector className={classes.selector} list={list} onSelect={onSelect} />
    </div>
  );
};

const TemplateSelector: FunctionComponent<{ className?: string; list: string[]; onSelect: (value: string) => void; }> = ({ className, list, onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const templatesMap = useSelector(getTemplatesMap);

  return (
    <Autocomplete
      className={className}
      value={null}
      onChange={(event, newValue: string) => {
        onSelect(newValue);
        setInputValue('');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={list}
      getOptionLabel={(option: string) => templatesMap[option]?.templateId}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Template"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

export default CopyToTemplateButton;

function useCopyToTemplate() {
  const dispatch = useDispatch<AsyncDispatch<CopyComponentsStats>>();
  const fireAsync = useFireAsync();
  const { enqueueSnackbar } = useSnackbar();
  return useCallback((componentsIds: string[], templateId: string) => {

    fireAsync(async () => {
      const stats = await dispatch(copyComponentsToTemplate({ componentsIds, templateId }));
      enqueueSnackbar(formatStats(stats), { variant: 'success' });
    });
  }, [dispatch, fireAsync, enqueueSnackbar]);
}

function formatStats(stats: CopyComponentsStats) {
  let message = stats.components > 1 ? `${stats.components} composants créés` : `${stats.components} composant créé`;

  if (stats.bindings) {
    message += stats.bindings > 1 ? `, ${stats.bindings} bindings créés` : `, ${stats.bindings} binding créé`;
  }

  return message;
}