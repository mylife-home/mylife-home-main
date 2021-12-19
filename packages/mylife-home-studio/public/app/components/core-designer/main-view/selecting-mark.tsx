import React, { FunctionComponent } from 'react';

import { Rect } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import Border from '../drawing/border';
import { Rectangle } from '../drawing/types';

const SelectingMark: FunctionComponent<{ rect: Rectangle }> = ({ rect }) => {
  const theme = useCanvasTheme();

  return (
    <>
      <Border
        {...rect}
        type='outer'
        color={theme.borderColorSelected}
        thickness={theme.selectionWidth}
      />

      <Rect {...rect} fill={theme.multiSelectingBackground} />
    </>
  );
};

export default SelectingMark;
