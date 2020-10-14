import React, { FunctionComponent, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import TreeView, { Type as TreeViewType } from './treeview';

const OnlineComponentsView: FunctionComponent = () => {
  const [value, setValue] = React.useState<TreeViewType>('instances-plugins-components');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value as TreeViewType);
  };

  return (
    <Box p={3}>
      <RadioGroup value={value} onChange={handleChange} row>
        <FormControlLabel value="instances-plugins-components" control={<Radio color="primary" />} label="instances / plugins / components" />
        <FormControlLabel value="instances-components" control={<Radio color="primary" />} label="instances / components" />
        <FormControlLabel value="plugins-components" control={<Radio color="primary" />} label="plugins / components" />
        <FormControlLabel value="components" control={<Radio color="primary" />} label="components" />
      </RadioGroup>

      <TreeView type={value} onNodeClick={console.log} />
    </Box>
  );
};

export default OnlineComponentsView;
