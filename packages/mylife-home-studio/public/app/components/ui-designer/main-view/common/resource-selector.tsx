import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { AppState } from '../../../../store/types';
import { getResourcesIds, getResourcesMap, getResource } from '../../../../store/ui-designer/selectors';
import { useComponentStyles } from '../../../lib/properties-layout';
import Image from './image';

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
  const resourcesMap = useSelector(getResourcesMap);

  return (
    <Autocomplete
      disableClearable={!nullable}
      options={resourcesIds}
      className={classes.component}
      getOptionLabel={id => resourcesMap[id]?.resourceId || ''}
      renderOption={(option) => <OptionRenderer id={option} />}
      renderInput={(params) => <InputRenderer params={params} value={value} label={resourcesMap[value]?.resourceId} />}
      value={value}
      onChange={(event: any, newValue: string) => {
        onChange(newValue);
      }}
    />
  );
};

export default ResourceSelector;

const InputRenderer: FunctionComponent<{ params: AutocompleteRenderInputParams; value: string; label: string }> = ({ params, value, label }) => {
  const classes = useStyles();
  const editorValue = (params.inputProps as { value: string })?.value;
  const showImage = label && editorValue === label; // do not show image while editing

  params.InputProps.startAdornment = (
    <InputAdornment position="start">{showImage ? <Image resource={value} className={classes.image} /> : <div className={classes.image} />}</InputAdornment>
  );

  return <TextField {...params} variant="outlined" />;
};

const OptionRenderer: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const resource = useSelector((state: AppState) => getResource(state, id));

  return (
    <>
      <Image resource={id} className={classes.image} />
      {resource.resourceId}
    </>
  );
};
