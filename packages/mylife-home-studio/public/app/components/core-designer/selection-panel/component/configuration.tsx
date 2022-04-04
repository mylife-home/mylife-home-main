import React, { FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import DebouncedTextField from '../../../lib/debounced-text-field';
import { Group, Item } from '../../../lib/properties-layout';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useComponentData } from './common';
import { AppState } from '../../../../store/types';
import { ConfigItem, ConfigType, Template } from '../../../../store/core-designer/types';
import { configureComponent } from '../../../../store/core-designer/actions';
import { getSelectedComponent, getActiveTemplate } from '../../../../store/core-designer/selectors';

const useStyles = makeStyles((theme) => ({
  editor: {
    width: '100%',
  },
}), { name: 'properties-component-configuration' });

const Configuration: FunctionComponent = () => {
  const { component, definition } = useComponentData();
  const template = useTabSelector(getActiveTemplate);
  const configure = useConfigure();

  if(component.external) {
    return null;
  }

  return (
    <Group title="Configuration" collapse>
      {definition.configIds.map((id => {
        const configItem = definition.config[id];
        const configValue = component.config[id];

        return (
          <Item key={id} title={id}>
            <Editor item={configItem} value={configValue} onChange={(value) => configure(id, value)} exported={isExported(template, component.id, id)} />
          </Item>
        );
      }))}
    </Group>
  );
};

export default Configuration;

function useConfigure() {
  const tabId = useTabPanelId();
  const componentId = useSelector(useCallback((state: AppState) => getSelectedComponent(state, tabId), [tabId]));
  const dispatch = useDispatch();

  return useCallback((configId: string, configValue: any) => {
    dispatch(configureComponent({ componentId, configId, configValue }));
  }, [dispatch, tabId, componentId]);
}

interface EditorProps {
  exported: boolean;
  item: ConfigItem;
  value: any;
  onChange: (value: any) => void;
}

const Editor: FunctionComponent<EditorProps> = (props) => {
  if (props.exported) {
    return <ExportedEditor {...props} />;
  }

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

const ExportedEditor: FunctionComponent<EditorProps> = ({ item }) => {
  const classes = useStyles();
  return (
    <TextField
      className={classes.editor}
      disabled
      helperText={getHelperText(item)}
      value={'<exporté>'}
    />
  );
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

function isExported(template: Template, componentId: string, configId: string) {
  return !!template && !!Object.values(template.exports.config).find(item => item.component === componentId && item.configName === configId);
}