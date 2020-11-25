import { makeStyles } from '@material-ui/core/styles';
import { StepConfig } from '../../../store/deploy/types';

export type SetStepConfig = (value: StepConfig) => void;

export const useStyles = makeStyles((theme) => ({
  itemWidth: {
    width: 200
  },
  // try to remove this pate when Autocomplete is more stable
  autoCompleteInput: {
    marginTop: -6,
    marginBottom: 0
  }
}));

export function formatHelperText(text: string) {
  // avoid line breaks on - (use non-breaking hyphens)
  return text && text.replace(/-/g, '\u2011');
}