import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { AppState } from '../../store/types';
import { getPluginsIds, getPlugin } from '../../store/online-components-view/selectors';

const OnlineComponentsView: FunctionComponent = () => {
  const [value, setValue] = React.useState('instances-plugins-components');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);

  const handleToggle = (event: React.ChangeEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.ChangeEvent, nodeIds: string[]) => {
    setSelected(nodeIds);
  };

  const pluginsIds = useSelector(getPluginsIds);

  return (
    <Box p={3}>
      <RadioGroup value={value} onChange={handleChange} row>
        <FormControlLabel value='instances-plugins-components' control={<Radio color='primary' />} label='instances / plugins / components' />
        <FormControlLabel value='instances-components' control={<Radio color='primary' />} label='instances / components' />
        <FormControlLabel value='plugins-components' control={<Radio color='primary' />} label='plugins / components' />
        <FormControlLabel value='components' control={<Radio color='primary' />} label='components' />
      </RadioGroup> 

      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
      >
        {pluginsIds.map(({ instanceName, id }) => (
          <Plugin instanceName={instanceName} pluginId={id} />
        ))}
        <TreeItem nodeId="1" label="Applications">
          <TreeItem nodeId="2" label="Calendar" />
          <TreeItem nodeId="3" label="Chrome" />
          <TreeItem nodeId="4" label="Webstorm" />
        </TreeItem>
        <TreeItem nodeId="5" label="Documents">
          <TreeItem nodeId="6" label="Material-UI">
            <TreeItem nodeId="7" label="src">
              <TreeItem nodeId="8" label="index.js" />
              <TreeItem nodeId="9" label="tree-view.js" />
            </TreeItem>
          </TreeItem>
        </TreeItem>
      </TreeView>
    </Box>
  );
};

export default OnlineComponentsView;

const Plugin: FunctionComponent<{ instanceName: string, pluginId: string }> = ({ instanceName, pluginId }) => {
  const plugin = useSelector((state: AppState) => getPlugin(state, instanceName, pluginId));
  return (
    <TreeItem nodeId={`${instanceName}$${pluginId}`} label={plugin.id}>
    </TreeItem>
  );
};