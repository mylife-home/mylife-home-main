import { UiControlData, UiProject, UiControlTextData, UiViewData } from '../../../../shared/project-manager';
import { Definition, Window, Control, ControlText } from '../../../../shared/ui-model';

export function buildDeployDefinition(project: UiProject) {
  const definition: Definition = {
    resources: [],
    styles: [],
    windows: [],
    defaultWindow: project.defaultWindow
  };

  for (const [id, resource] of Object.entries(project.resources)) {
    definition.resources.push({ id, ...resource });
  }

  for (const [id, style] of Object.entries(project.styles)) {
    definition.styles.push({ id, ...style });
  }

  for (const [id, window] of Object.entries(project.windows)) {
    const controls: Control[] = [];
    addViewElements(project, controls, 0, 0, [], window);

    definition.windows.push({ ...window, id, controls });
  }

  return definition;
}

function addViewElements(project: UiProject, controls: Control[], xBase: number, yBase: number, pathBase: string[], view: UiViewData) {
  for (const [id, templateInstance] of Object.entries(view.templates)) {
    const template = project.templates[templateInstance.templateId];
    const path = [...pathBase, id];
    const x = xBase + templateInstance.x;
    const y = yBase + templateInstance.y;
    addViewElements(project, controls, x, y, path, template);
  }

  for (const [id, control] of Object.entries(view.controls)) {
    const path = [...pathBase, id];
    const x = xBase + control.x;
    const y = yBase + control.y;
    controls.push({ ... control, id: path.join(':'), x, y, text: buildText(control.text) });
  }
}

function buildText(text: UiControlTextData): ControlText {
  if (!text) {
    return text;
  }

  return {
    ...text,
    context: text.context.map(item => {
      const { testValue, ...props } = item;
      return props;
    })
  };
}