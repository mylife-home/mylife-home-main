import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import Link from '@material-ui/core/Link';

import DeleteButton from '../../lib/delete-button';
import { useTabSelector } from '../../lib/use-tab-selector';
import { useReportError } from '../../lib/use-error-handling';
import { Group, Item } from '../../lib/properties-layout';
import { useCanvasTheme } from '../drawing/theme';
import { computeComponentRect, mergeRects, computeCenter } from '../drawing/shapes';
import { useSelectComponent } from '../selection';
import CenterButton from './center-button';
import CopyToTemplateButton from './copy-to-template';

import { getComponentsMap, getSelectedComponentsArray, makeGetExportedComponentIds, getComponentDefinitionPropertiesGetter } from '../../../store/core-designer/selectors';
import { clearComponents } from '../../../store/core-designer/actions';

const useStyles = makeStyles((theme) => ({
  actions: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
  },
}), { name: 'properties-multiple' });

const Multiple: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const componentsIds = useTabSelector(getSelectedComponentsArray);
  const { clearAll } = useActionsConnect(componentsIds);
  const centerPosition = useCenterPosition(componentsIds);
  const selectComponent = useSelectComponent();

  return (
    <div className={className}>
      <Group title="Sélection multiple">
        <div className={classes.actions}>
          <CenterButton position={centerPosition} />
          <CopyToTemplateButton componentsIds={componentsIds} />
          <DeleteButton icon tooltip="Supprimer tous les composants" confirmText="Êtes-vous sûr de vouloir supprimer tous les composants ?" onConfirmed={clearAll} />
        </div>

        <Item title="Composants" multiline>
          {componentsIds.map(id => (
            <Link key={id} variant="body1" color="textPrimary" href="#" onClick={() => selectComponent(id)}>{id}</Link>
          ))}
        </Item>
      </Group>
    </div>
  );
};

export default Multiple;

function useActionsConnect(componentsIds: string[]) {
  const dispatch = useDispatch();
  const getExportedComponentIds = useMemo(() => makeGetExportedComponentIds(), []);
  const exportedComponentIds = useTabSelector(getExportedComponentIds);
  const componentsMap = useSelector(getComponentsMap);
  const onError = useReportError();

  const clearAll = useCallback(() => {
    const exportedDeleted = componentsIds.filter(componentId => exportedComponentIds.includes(componentId));
    if (exportedDeleted.length > 0) {
      const ids = exportedDeleted.map(id => `'${componentsMap[id].componentId}'`).join(', ');
      const err = new Error(`Les composants suivants sont exportés et ne peuvent pas être supprimés : ${ids}.`);
      onError(err);
    } else {
      dispatch(clearComponents({ componentsIds }));
    }
  }, [dispatch, componentsIds]);

  return { clearAll };
}

function useCenterPosition(componentsIds: string[]) {
  const theme = useCanvasTheme();
  const componentsMap = useSelector(getComponentsMap);
  const getComponentDefinitionProperties = useSelector(getComponentDefinitionPropertiesGetter);

  return useMemo(() => {
    const rects = componentsIds.map(id => {
      const component = componentsMap[id];
      const definition = getComponentDefinitionProperties(component.definition);
      return computeComponentRect(theme, component, definition);
    });

    return computeCenter(mergeRects(rects));

  }, [theme, componentsIds, componentsMap, getComponentDefinitionProperties]);
}
