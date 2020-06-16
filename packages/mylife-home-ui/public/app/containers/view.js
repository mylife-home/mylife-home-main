'use strict';

import { connect } from 'react-redux';
import { getOnline, getViewDisplay } from '../store/selectors';
import { actionPrimary, actionSecondary } from '../store/actions/actions';
import { viewClose } from '../store/actions/view';

import Window from '../components/window';

const mapStateToProps = () => (state, props) => ({
  online : getOnline(state, props),
  view   : getViewDisplay(state, props)
});

const mapDispatchToProps = (dispatch) => ({
  onActionPrimary   : (window, component) => dispatch(actionPrimary(window, component)),
  onActionSecondary : (window, component) => dispatch(actionSecondary(window, component)),
  onWindowClose     : () => dispatch(viewClose())
});

const View = connect(
  mapStateToProps,
  mapDispatchToProps
)(Window);

export default View;
