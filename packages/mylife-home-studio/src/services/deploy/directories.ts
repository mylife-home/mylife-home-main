import path from 'path';

interface Directories {
  base: string;
  files: string;
  recipes: string;
}

const directories: Directories = {
  base: null,
  files: null,
  recipes: null,
};

export function configure(dataDirectory: string) {
  directories.base = path.resolve(__dirname, '..', dataDirectory);
  directories.files = path.join(directories.base, 'files');
  directories.recipes = path.join(directories.base, 'recipes');
}

export const base = () => directories.base;
export const files = () => directories.files;
export const recipes = () => directories.recipes;
