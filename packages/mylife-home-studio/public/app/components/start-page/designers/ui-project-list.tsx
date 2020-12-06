import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import humanize from 'humanize-plus';

import { useAction } from '../../lib/use-actions';
import { AppState } from '../../../store/types';
import { getUiProjectsIds, getUiProjectInfo } from '../../../store/projects-list/selectors';
import { importV1Project, createNewProject } from '../../../store/projects-list/actions';
import { ProjectList, ProjectItem } from './project-list';

const UiProjectList: FunctionComponent = () => {
  const ids = useSelector(getUiProjectsIds);
  const importV1 = useAction(importV1Project);
  const createNew = useAction(createNewProject);

  return (
    <ProjectList
      ids={ids}
      onCreateNew={(id) => createNew({ type: 'ui', id })}
      onImportV1={(content) => importV1({ type: 'ui', content })}
      onRename={() => console.log('rename')}
      onDelete={() => console.log('delete')}
      onOpen={() => console.log('delete')}
    >
      {ids.map((id) => (
        <UiPojectItem key={id} id={id} />
      ))}
    </ProjectList>
  );
};

export default UiProjectList;

const UiPojectItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const info = useSelector((state: AppState) => getUiProjectInfo(state, id));

  const formattedInfo = useMemo(() => [
    `${info.windowsCount} fenêtres`,
    `${info.componentsCount} componsants importés`,
    `${info.resourcesCount} ressources (${humanize.fileSize(info.resourcesSize)})`,
  ], [info]);

  return <ProjectItem id={id} info={formattedInfo} />;
};
