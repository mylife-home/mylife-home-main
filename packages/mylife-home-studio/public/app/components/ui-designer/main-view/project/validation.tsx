import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import PublishIcon from '@material-ui/icons/Publish';

import { Container, Title } from '../../../lib/main-view-layout';
import { ProjectIcon, ComponentIcon, InstanceIcon } from '../../../lib/icons';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useFireAsync } from '../../../lib/use-error-handling';
import { AppState } from '../../../../store/types';
import { getDefaultWindow } from '../../../../store/ui-designer/selectors';
import { setDefaultWindow, validateProject } from '../../../../store/ui-designer/actions';
import { DefaultWindow } from '../../../../../../shared/ui-model';
import WindowSelector from '../common/window-selector';
import { Group, Item } from '../common/properties-layout';

export function useProjectValidation() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();

  return useCallback(() => {
    fireAsync(async () => {
      const validatorErrors = await dispatch(validateProject({ id: tabId }));
      console.log('TODO', validatorErrors);
    });
  }, [tabId, dispatch, fireAsync]);
}
