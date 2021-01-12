import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { getResourcesIds } from '../../../../store/ui-designer/selectors';
import Image from './image';
import { useComponentStyles } from './properties-layout';

const useStyles = makeStyles((theme) => ({
  image: {
    width: 16,
    height: 16,
    marginRight: theme.spacing(1),
  },
}));

export interface ResourceSelectorProps {
  nullable?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const ResourceSelector: FunctionComponent<ResourceSelectorProps> = ({ nullable = false, value, onChange }) => {
  const classes = useComponentStyles();
  const resourcesIds = useTabSelector(getResourcesIds);

  return (
    <Autocomplete
      disableClearable={!nullable}
      options={resourcesIds}
      className={classes.component}
      renderOption={(option) => <OptionRenderer option={option} />}
      renderInput={(params) => <InputRenderer params={params} value={value} />}
      value={value}
      onChange={(event: any, newValue: string) => {
        onChange(newValue);
      }}
    />
  );
};

export default ResourceSelector;

const InputRenderer: FunctionComponent<{ params: AutocompleteRenderInputParams; value: string }> = ({ params, value }) => {
  const classes = useStyles();
  const editorValue = (params.inputProps as { value: string })?.value;
  const showImage = value && editorValue === value; // do not show image while editing

  params.InputProps.startAdornment = (
    <InputAdornment position="start">{showImage ? <Image resource={value} className={classes.image} /> : <div className={classes.image} />}</InputAdornment>
  );

  console.log(params);

  return <TextField {...params} variant="outlined" />;
};

const OptionRenderer: FunctionComponent<{ option: string }> = ({ option }) => {
  const classes = useStyles();

  return (
    <>
      <Image resource={option} className={classes.image} />
      {option}
    </>
  );
};
