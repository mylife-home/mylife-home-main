import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useControlState } from './window-state';
import { Group, Item } from '../common/properties-layout';
import SnappedIntegerEditor from '../common/snapped-integer-editor';
import ResourceSelector from '../common/resource-selector';
import WindowSelector from '../common/window-selector';
import StringEditor from '../common/string-editor';
import { useSnapValue } from './snap';

const useStyles = makeStyles((theme) => ({
}));

const PropertiesControl: FunctionComponent<{ className?: string; id: string; }> = ({ className, id }) => {
  const classes = useStyles();
  const { control, update } = useControlState(id);
  const snap = useSnapValue();

  return (
    <div className={className}>
      <Group title={"Contrôle"}>
        <div>TODO: delete/duplicate</div>
        <Item title={"Identifiant"}>
          <StringEditor value={control.id} onChange={value => update({ id: value })} />
        </Item>
        <Item title={"X"}>
          <SnappedIntegerEditor snap={snap} value={control.x} onChange={value => update({ x: value })} />
        </Item>
        <Item title={"Y"}>
          <SnappedIntegerEditor snap={snap} value={control.y} onChange={value => update({ y: value })} />
        </Item>
        <Item title={"Largeur"}>
          <SnappedIntegerEditor snap={snap} value={control.width} onChange={value => update({ width: value })} />
        </Item>
        <Item title={"Longueur"}>
          <SnappedIntegerEditor snap={snap} value={control.height} onChange={value => update({ height: value })} />
        </Item>
      </Group>
    </div>
  );
};

export default PropertiesControl;