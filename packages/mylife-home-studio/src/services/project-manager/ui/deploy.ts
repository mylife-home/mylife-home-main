import { UiControlData, UiProject, UiControlTextData } from '../../../../shared/project-manager';
import { Definition, Control, ControlText } from '../../../../shared/ui-model';

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

  for (const [id, { controls, ... window }] of Object.entries(project.windows)) {
    definition.windows.push({ id, controls: buildControls(controls), ...window });
  }

  return definition;
}

function buildControls(projectControls: { [id: string]: UiControlData }) {
  const controls: Control[] = [];

  for (const [id, control] of Object.entries(projectControls)) {
    controls.push({ id, ... control, text: buildText(control.text) });
  }

  return controls;
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