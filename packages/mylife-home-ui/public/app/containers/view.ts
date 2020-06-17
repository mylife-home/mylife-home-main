import { connect } from 'react-redux';
import { AppState, AppThunkDispatch } from '../store/types';
import { getOnline } from '../store/selectors/online';
import { getViewDisplay } from '../store/selectors/view';
import { actionPrimary, actionSecondary } from '../store/actions/actions';
import { viewClose } from '../store/actions/view';
import Window from '../components/window';

const mapStateToProps = (state: AppState) => ({
  online: getOnline(state),
  view: getViewDisplay(state)
});

const mapDispatchToProps = (dispatch: AppThunkDispatch) => ({
  onActionPrimary: (window: string, component: string) => dispatch(actionPrimary(window, component)),
  onActionSecondary: (window: string, component: string) => dispatch(actionSecondary(window, component)),
  onWindowClose: () => dispatch(viewClose())
});

const View = connect(
  mapStateToProps,
  mapDispatchToProps
)(Window);

export default View;
