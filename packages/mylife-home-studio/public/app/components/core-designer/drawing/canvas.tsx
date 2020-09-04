import React, { useContext, forwardRef, FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import StoreHierarchyFix from '../../lib/store-hierarchy-fix';
import StoreProvider from '../../lib/store-provider';
import { TabIdContext } from '../../lib/tab-panel';
import { SelectionContext } from '../selection';
import { Konva, Stage, StageProps } from './konva';
import { CanvasThemeContext } from './theme';
import { ViewInfoContext } from './view-info';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

const Canvas = forwardRef<Konva.Stage, StageProps>(({ children, className, ...props }, ref) => {
  const themeProps = useContext(CanvasThemeContext);
  const viewInfoProps = useContext(ViewInfoContext);
  const tabId = useContext(TabIdContext);
  const selectionProps = useContext(SelectionContext);
  const classes = useStyles();


  return (
    <Stage {...props} ref={ref} className={clsx(className, classes.container)}>
      <StoreProvider>
        <CanvasThemeContext.Provider value={themeProps}>
          <ViewInfoContext.Provider value={viewInfoProps}>
            <TabIdContext.Provider value={tabId}>
              <SelectionContext.Provider value={selectionProps}>
                {children}
              </SelectionContext.Provider>
            </TabIdContext.Provider>
          </ViewInfoContext.Provider>
        </CanvasThemeContext.Provider>
      </StoreProvider>
    </Stage>
  );
});

export default Canvas;
