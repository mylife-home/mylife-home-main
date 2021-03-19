import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import DebouncedTextField from '../../../lib/debounced-text-field';
import { Group, Item } from '../../../lib/properties-layout';
import { useComponentData } from './common';
import { ConfigItem, ConfigType } from '../../../../store/core-designer/types';

const useStyles = makeStyles((theme) => ({
  editor: {
    width: '100%',
  },
}), { name: 'properties-component-configuration' });

const Configuration: FunctionComponent = () => {
  const { component, plugin } = useComponentData();

  if(component.external) {
    return null;
  }

  return (
    <Group title="Configuration" collapse>
      {plugin.configIds.map((id => {
        const configItem = plugin.config[id];
        const configValue = component.config[id];

        return (
          <Item key={id} title={id}>
            <Editor item={configItem} value={configValue} onChange={() => console.log('TODO')} />
          </Item>
        );
      }))}
    </Group>
  );
};

export default Configuration;

interface EditorProps {
  item: ConfigItem;
  value: any;
  onChange: (value: any) => void;
}

const Editor: FunctionComponent<EditorProps> = (props) => {
  const type = props.item.valueType;
  switch(type) {
    case ConfigType.STRING:
      return <StringEditor {...props} />;
    case ConfigType.BOOL:
      return <BoolEditor {...props} />;
    case ConfigType.INTEGER:
      return <IntegerEditor {...props} />;
    case ConfigType.FLOAT:
      return <FloatEditor {...props} />;
    default:
      throw new Error(`Unsupported configuration value type: '${type}'`);
  }
};

const StringEditor: FunctionComponent<EditorProps> = ({ item, value, onChange }) => {
  const classes = useStyles();
  return (
    <DebouncedTextField
      className={classes.editor}
      helperText={getHelperText(item)}
      value={value}
      onChange={onChange}
    />
  );

};

const BoolEditor: FunctionComponent<EditorProps> = ({ item, value, onChange }) => {
  const classes = useStyles();
  return (
    <FormControl className={classes.editor}>
      <Checkbox color="primary" checked={value} onChange={() => onChange(!value)} />
      <FormHelperText>{getHelperText(item)}</FormHelperText>
    </FormControl>
  );
};

const IntegerEditor: FunctionComponent<EditorProps> = ({ item, value, onChange }) => {
  const classes = useStyles();
  return (
    <DebouncedTextField
      className={classes.editor}
      helperText={getHelperText(item)}
      value={formatNumber(value)}
      onChange={(value) => onChange(parseNumber(value, 'int'))}
      type="number"
      inputProps={{ step: 1 }}
    />
  );
};

const FloatEditor: FunctionComponent<EditorProps> = ({ item, value, onChange }) => {
  const classes = useStyles();
  return (
    <DebouncedTextField
      className={classes.editor}
      helperText={getHelperText(item)}
      value={formatNumber(value)}
      onChange={(value) => onChange(parseNumber(value, 'float'))}
      type="number"
    />
  );
};

function getHelperText(item: ConfigItem) {
  return `${item.description || ''} (${item.valueType})`;
}

function formatNumber(value: number) {
  return value.toString(10);
}

function parseNumber(value: string, type: 'float' | 'int') {
  const number = type === 'float' ? parseFloat(value) : parseInt(value, 10);
  return isNaN(number) ? 0 : number;
}
