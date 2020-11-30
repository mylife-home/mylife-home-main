import { CoreProject } from '../../../shared/project-manager';
import { Store } from './store';

export class CoreProjects extends Store<CoreProject> {

  protected initNew(name: string): CoreProject {
    return {
      name,
    };
  }

  // TODO
}
