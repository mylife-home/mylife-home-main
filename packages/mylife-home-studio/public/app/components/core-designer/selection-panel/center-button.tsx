
import React, { FunctionComponent, useCallback } from 'react';

import IconButton from '@material-ui/core/IconButton';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';

import { Point } from '../drawing/types';
import { usePosition } from '../drawing/viewport-manips';

interface CenterButtonProps {
  position: Point;
}

const CenterButton: FunctionComponent<CenterButtonProps> = ({ position }) => {
  const setCenter = useSetCenter(position);
  return (
    <IconButton onClick={setCenter}>
      <CenterFocusStrongIcon />
    </IconButton>
  );
};

export default CenterButton;

function useSetCenter(position: Point) {
  const { setLayerPosition } = usePosition();

  return useCallback(
    () => setLayerPosition(position),
    [setLayerPosition, position]
  );
}
