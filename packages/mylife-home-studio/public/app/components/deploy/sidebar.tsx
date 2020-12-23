import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { useAction } from '../lib/use-actions';
import { SideBarList, SideBarDivider, Section, Item } from '../lib/sidebar-layout';
import { RecipeIcon, StartIcon, RunsIcon, FileIcon } from './icons';
import { useSelection } from './selection';
import { AppState } from '../../store/types';
import { getPinnedRecipesIds, getRun, getRunsIds } from '../../store/deploy/selectors';
import { startRecipe } from '../../store/deploy/actions';
import { getRunTitle, getRunIcon } from './run';

const SideBar: FunctionComponent = () => {
  return (
    <SideBarList>
      <Recipes />
      <SideBarDivider />
      <Runs />
      <SideBarDivider />
      <Files />
    </SideBarList>
  );
};

export default SideBar;

const Recipes: FunctionComponent = () => {
  const { select } = useSelection();
  const { recipesIds, startRecipe } = useRecipesConnect();
  return (
    <>
      <Section title="Recettes" icon={RecipeIcon} onClick={() => select({ type: 'recipes' })} />
      {recipesIds.map((id) => (
        <Item
          key={id}
          title={id}
          icon={RecipeIcon}
          onClick={() => select({ type: 'recipe', id })}
          secondary={{ tooltip: 'Démarrer la recette', icon: StartIcon, onClick: () => startRecipe(id) }}
        />
      ))}
    </>
  );
};

function useRecipesConnect() {
  return {
    recipesIds: useSelector(getPinnedRecipesIds),
    startRecipe: useAction(startRecipe),
  };
}

const Runs: FunctionComponent = () => {
  const { select } = useSelection();
  const runsIds = useSelector(getRunsIds);
  return (
    <>
      <Section title="Exécutions" icon={RunsIcon} onClick={() => select({ type: 'runs' })} />
      {runsIds.map((id) => (
        <RunItem key={id} id={id} />
      ))}
    </>
  );
};

const RunItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const { select } = useSelection();
  const run = useSelector((state: AppState) => getRun(state, id));
  return <Item title={getRunTitle(run)} icon={getRunIcon(run)} onClick={() => select({ type: 'run', id })} />;
};

const Files: FunctionComponent = () => {
  const { select } = useSelection();
  return (
    <Section title="Fichiers" icon={FileIcon} onClick={() => select({ type: 'files' })} />
  );
};
