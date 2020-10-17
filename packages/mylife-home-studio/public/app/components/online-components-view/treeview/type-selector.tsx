import React, { FunctionComponent } from 'react';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import { Type } from './types';

const TypeSelector: FunctionComponent<{ className?: string; type: Type; setType: (type: Type) => void }> = ({ className, type, setType }) => {
  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType(event.target.value as Type);
  };

  return (
    <RadioGroup className={className} value={type} onChange={handleTypeChange} row>
      <FormControlLabel value="instances-plugins-components" control={<Radio color="primary" />} label="instances / plugins / components" />
      <FormControlLabel value="instances-components" control={<Radio color="primary" />} label="instances / components" />
      <FormControlLabel value="plugins-components" control={<Radio color="primary" />} label="plugins / components" />
      <FormControlLabel value="components" control={<Radio color="primary" />} label="components" />
    </RadioGroup>
  );
};

export default TypeSelector;