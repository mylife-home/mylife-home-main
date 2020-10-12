import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

const OnlineComponentsView: FunctionComponent = () => {
  const [value, setValue] = React.useState('instances-plugins-components');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Box p={3}>
      <Typography>Components</Typography>

      <RadioGroup value={value} onChange={handleChange} row>
        <FormControlLabel value='instances-plugins-components' control={<Radio color='primary' />} label='instances / plugins / components' />
        <FormControlLabel value='instances-components' control={<Radio color='primary' />} label='instances / components' />
        <FormControlLabel value='plugins-components' control={<Radio color='primary' />} label='plugins / components' />
        <FormControlLabel value='components' control={<Radio color='primary' />} label='components' />
      </RadioGroup> 
    </Box>
  );
};

export default OnlineComponentsView;
