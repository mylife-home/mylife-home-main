import React, { FunctionComponent, useMemo } from 'react';

import TextField, { StandardTextFieldProps } from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import { levels, useLevelStyles, getLevelClass, findLevelByValue, getLevelById } from './levels';

type LevelSelectorProps = Omit<StandardTextFieldProps, 'children' | 'onChange' | 'value'> & { label: string, value: number, onChange: (value: number) => void };

const LevelSelector: FunctionComponent<LevelSelectorProps> = ({ value, onChange, ...props }) => {
  const classes = useLevelStyles();

  // seems that TextField with Select can only handle string value
  const level = useMemo(() => findLevelByValue(value), [value]);
  const levelClass = getLevelClass(classes, level);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(levelIdToValue(event.target.value));
  };

  return (
    <TextField {...props} select value={level ? level.id : ''} onChange={handleChange} inputProps={{ className: levelClass }}>
      <MenuItem value={null}>{'-'}</MenuItem>

      {levels.map(level => (
        <MenuItem key={level.id} value={level.id} className={getLevelClass(classes, level)}>{level.id.toUpperCase()}</MenuItem>
      ))}

    </TextField>
  );
};

export default LevelSelector;

function levelIdToValue(id: string) {
  if (!id) {
    return null;
  }

  const level = getLevelById(id);
  return level.value;
}