import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAction } from '../lib/use-actions';
import { AppState } from '../../store/types';
import { getCoreProjectsIds, getCoreProjectInfo } from '../../store/projects-list/selectors';
import { importV1Project, createNewProject, duplicateProject, renameProject, deleteProject } from '../../store/projects-list/actions';
import { ProjectList, ProjectItem } from './project-list';

const CoreProjectList: FunctionComponent = () => {
  const ids = useSelector(getCoreProjectsIds);
  const importV1 = useAction(importV1Project);
  const createNew = useAction(createNewProject);
  const duplicate = useAction(duplicateProject);
  const rename = useAction(renameProject);
  const doDelete = useAction(deleteProject);

  return (
    <ProjectList
      title="Designers Core"
      ids={ids}
      onCreateNew={(id) => createNew({ type: 'core', id })}
      onImportV1={(content) => importV1({ type: 'core', content })}
      onDuplicate={(id, newId) => duplicate({ type: 'core', id, newId })}
      onRename={(id, newId) => rename({ type: 'core', id, newId })}
      onDelete={(id) => doDelete({ type: 'core', id })}
      onOpen={(id) => console.log('TODO open', id)}
    >
      {ids.map((id) => (
        <CorePojectItem key={id} id={id} />
      ))}
    </ProjectList>
  );
};

export default CoreProjectList;

const CorePojectItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const info = useSelector((state: AppState) => getCoreProjectInfo(state, id));

  const formattedInfo = useMemo(() => [
    'TODO',
  ], [info]);

  return <ProjectItem id={id} info={formattedInfo} />;
};
