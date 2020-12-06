import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import humanize from 'humanize-plus';

import { useAction } from '../lib/use-actions';
import { AppState } from '../../store/types';
import { getUiProjectsIds, getUiProjectInfo } from '../../store/projects-list/selectors';
import { importV1Project, createNewProject, duplicateProject, renameProject, deleteProject } from '../../store/projects-list/actions';
import { newUiDesignerTab } from '../../store/tabs/actions';
import { ProjectList, ProjectItem } from './project-list';

const UiProjectList: FunctionComponent<{ className?: string }> = ({ className }) => {
  const ids = useSelector(getUiProjectsIds);
  const importV1 = useAction(importV1Project);
  const createNew = useAction(createNewProject);
  const duplicate = useAction(duplicateProject);
  const rename = useAction(renameProject);
  const doDelete = useAction(deleteProject);
  const openTab = useAction(newUiDesignerTab);

  return (
    <ProjectList
      className={className}
      title="Designers UI"
      ids={ids}
      onCreateNew={(id) => createNew({ type: 'ui', id })}
      onImportV1={(content) => importV1({ type: 'ui', content })}
      onDuplicate={(id, newId) => duplicate({ type: 'ui', id, newId })}
      onRename={(id, newId) => rename({ type: 'ui', id, newId })}
      onDelete={(id) => doDelete({ type: 'ui', id })}
      onOpen={(id) => openTab({ projectId: id })}
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
    `${info.resourcesCount} ressources (${humanize.fileSize(info.resourcesSize)})`,
    `${info.componentsCount} componsants importés`,
  ], [info]);

  return <ProjectItem id={id} info={formattedInfo} />;
};
