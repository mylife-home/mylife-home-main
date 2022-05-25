import { UiControlData, UiProject, UiControlTextData, UiViewData, UiTemplateInstanceBinding, UiControlDisplayData, UiActionData } from '../../../../shared/project-manager';
import { Definition, Window, Control, ControlText, ControlDisplay, Action } from '../../../../shared/ui-model';

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
    addViewElements(project, controls, 0, 0, [], window, {});

    definition.windows.push({ ...window, id, controls });
  }

  return definition;
}

type Bindings = { [memberName: string]: UiTemplateInstanceBinding };

function addViewElements(project: UiProject, controls: Control[], xBase: number, yBase: number, pathBase: string[], view: UiViewData, bindings: Bindings) {
  for (const [id, templateInstance] of Object.entries(view.templates)) {
    const template = project.templates[templateInstance.templateId];
    const path = [...pathBase, id];
    const x = xBase + templateInstance.x;
    const y = yBase + templateInstance.y;

    // replace bindings in instance
    const instanceBindings: Bindings = {};

    for (const [id, binding] of Object.entries(templateInstance.bindings)) {
      if (binding.componentId) {
        instanceBindings[id] = binding;
      } else {
        // resolve binding
        instanceBindings[id] = bindings[binding.memberName];
      }
    }

    addViewElements(project, controls, x, y, path, template, instanceBindings);
  }

  for (const [id, control] of Object.entries(view.controls)) {
    const finalId = [...pathBase, id].join(':');
    controls.push(buildControl(finalId, control, xBase, yBase, bindings));
  }
}

function buildControl(id: string, control: UiControlData, xBase: number, yBase: number, bindings: Bindings) {
  return {
    ... control,
    id,
    x: xBase + control.x,
    y: yBase + control.y,
    display: buildDisplay(control.display, bindings),
    text: buildText(control.text, bindings),
    primaryAction: buildAction(control.primaryAction, bindings),
    secondaryAction: buildAction(control.secondaryAction, bindings),
  };
}

function buildDisplay(display: UiControlDisplayData, bindings: Bindings): ControlDisplay {
  if (!display?.componentState || display.componentId) {
    return display;
  }

  const binding = bindings[display.componentState];

  return {
    ...display,
    componentId: binding.componentId,
    componentState: binding.memberName
  };
}

function buildText(text: UiControlTextData, bindings: Bindings): ControlText {
  if (!text) {
    return text;
  }

  return {
    ...text,
    context: text.context.map(item => {
      const { id, componentId, componentState } = item;

      if (componentId) {
        return { id, componentId, componentState };
      }

      const binding = bindings[componentState];
      return {
        id,
        componentId: binding.componentId,
        componentState: binding.memberName
      };
    })
  };
}

function buildAction(action: UiActionData, bindings: Bindings): Action {
  if (!action?.component || action.component.id) {
    return action;
  }

  const binding = bindings[action.component.action];

  return {
    ...action,
    component: {
      id: binding.componentId,
      action: binding.memberName
    }
  };
}
