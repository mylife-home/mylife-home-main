import { useInputDialog } from './input';

export function useRenameDialog(existingNames: string[], currentName: string, message: string) {
  const showInput = useInputDialog();

  const options = {
    title: 'Nouveau nom',
    message,
    initialText: currentName,
    validator(newName: string) {
      if (newName === currentName) {
        return; // permitted, but won't do anything
      }
      if (!newName) {
        return 'Nom vide';
      }
      if (existingNames.includes(newName)) {
        return 'Ce nom existe déjà';
      }
    }
  };

  return async () => {
    const { status, text: newName } = await showInput(options);
    if (currentName === newName) {
      // transform into cancel
      return { status: 'cancel' };
    }

    return { status, newName };
  };
}