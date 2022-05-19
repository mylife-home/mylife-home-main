import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { makeGetTemplateUsage } from '../../../../../store/ui-designer/selectors';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import { Group, Item } from '../../../../lib/properties-layout';
import SnappedIntegerEditor from '../../common/snapped-integer-editor';
import ReadonlyStringEditor from '../../common/readonly-string-editor';
import ElementPathBreadcrumbs from '../../common/element-path-breadcrumbs';
import { useTemplateState } from '../view-state';
import { useSnapValue } from '../snap';
import TemplateExports from './template-exports';

const useStyles = makeStyles((theme) => ({
  breadcrumbs: {
    flex: 1,
    margin: theme.spacing(1),
  },
  newButton: {
    color: theme.palette.success.main,
  },
}));

const PropertiesTemplate: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const { template, update } = useTemplateState();
  const snap = useSnapValue();
  const usage = useTemplateUsage(template.id);

  return (
    <div className={className}>
      <Group title={'Template'}>
        <Item title={'Identifiant'}>
          <ReadonlyStringEditor value={template.templateId} />
        </Item>
        <Item title={'Largeur'}>
          <SnappedIntegerEditor snap={snap} value={template.width} onChange={(value) => update({ width: value })} />
        </Item>
        <Item title={'Hauteur'}>
          <SnappedIntegerEditor snap={snap} value={template.height} onChange={(value) => update({ height: value })} />
        </Item>
      </Group>

      <Group title={'Utilisation'}>
        {usage.map((item, index) => (
          <Item key={index}>
            <ElementPathBreadcrumbs className={classes.breadcrumbs} item={item} />
          </Item>
        ))}
      </Group>

      <TemplateExports />
    </div>
  );
};

export default PropertiesTemplate;

function useTemplateUsage(id: string) {
  const getTemplateUsage = useMemo(() => makeGetTemplateUsage(), []);
  return useTabSelector((state, tabId) => getTemplateUsage(state, tabId, id));
}
