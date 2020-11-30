import { UiProject } from '../../../shared/project-manager';
import { Store } from './store';

export class UiProjects extends Store<UiProject> {
  
  protected initNew(name: string): UiProject {
    return {
      name,
      definition: { resources: [], windows: [], defaultWindow: {} },
      componentData: { components: [], plugins: {} }
    };
  }

  // TODO
}
