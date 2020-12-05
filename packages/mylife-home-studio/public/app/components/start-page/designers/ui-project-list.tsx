import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { useAction } from '../../lib/use-actions';
import { getUiProjectsIds } from '../../../store/projects-list/selectors';
import { importV1Project, createNewProject } from '../../../store/projects-list/actions';
import { ProjectList, ProjectItem } from './project-list';

const UiProjectList: FunctionComponent = () => {
  const ids = useSelector(getUiProjectsIds);
  const importV1 = useAction(importV1Project);
  const createNew = useAction(createNewProject);

  return (
    <ProjectList ids={ids} onCreateNew={(id) => createNew({ type: 'ui', id })} onImportV1={(content) => importV1({ type: 'ui', content })}>
      {ids.map((id) => (
        <ProjectItem key={id} id={id} info={['a', 'b']} onRename={() => console.log('rename')} onDelete={() => console.log('delete')} />
      ))}
    </ProjectList>
  );
};

export default UiProjectList;
