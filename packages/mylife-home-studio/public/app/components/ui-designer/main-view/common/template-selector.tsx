import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { getTemplatesIds, getTemplatesMap } from '../../../../store/ui-designer/selectors';
import { useComponentStyles } from '../../../lib/properties-layout';

export interface TemplateSelectorProps {
  nullable?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const TemplateSelector: FunctionComponent<TemplateSelectorProps> = ({ nullable = false, value, onChange }) => {
  const classes = useComponentStyles();
  const templatesIds = useTabSelector(getTemplatesIds);
  const templatesMap = useSelector(getTemplatesMap);

  return (
    <Autocomplete
      disableClearable={!nullable}
      options={templatesIds}
      getOptionLabel={id => templatesMap[id]?.templateId || ''}
      className={classes.component}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
    />
  );
};

export default TemplateSelector;
