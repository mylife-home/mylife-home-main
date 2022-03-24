import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';

import { useTabPanelId } from '../../lib/tab-panel';
import { AppState } from '../../../store/types';
import { activateView } from '../../../store/core-designer/actions';
import { getTemplateIds, getTemplatesMap, getActiveTemplateId } from '../../../store/core-designer/selectors';
import { useManagementDialog } from './management-dialog';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  select: {
    margin: theme.spacing(2),
    flex: 1,
  },
  config: {
  },
}), { name: 'template-selector' });

// Note: this will not collide as template ids will be "projectId:templateId"
const MAIN_VIEW = 'main';

const TemplateSelector: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const { templates, activeViewId, activateView } = useConnect();
  const showManagementDialog = useManagementDialog();

  const handleChange = (e: React.ChangeEvent<{ value: string; }>) => {
    const { value } = e.target;
    const viewId = value === MAIN_VIEW ? null : value;
    console.log('VIEW ID', viewId);
    activateView(viewId);
  };

  return (
    <div className={clsx(className, classes.container)}>
      <FormControl className={classes.select}>
        <Select
          value={activeViewId || MAIN_VIEW}
          label="Template"
          onChange={handleChange}
        >
          <MenuItem value={MAIN_VIEW}>{`<Vue principale>`}</MenuItem>

          {templates.map(({ id, templateId: label }) => (
            <MenuItem key={id} value={id}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <IconButton className={classes.config} onClick={showManagementDialog}>
        <SettingsIcon />
      </IconButton>
    </div>
  );
};

export default TemplateSelector;

function useConnect() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  const templatesMap = useSelector(getTemplatesMap);
  const templateIds = useSelector((state: AppState) => getTemplateIds(state, tabId));
  const templates = useMemo(() => templateIds.map(id => templatesMap[id]), [templateIds, templatesMap]);

  return {
    templates,
    activeViewId: useSelector((state: AppState) => getActiveTemplateId(state, tabId)),
    activateView: useCallback((templateId: string) => dispatch(activateView({ tabId, templateId })), [tabId, dispatch]),
  };
}