import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SignalWifi0BarIcon from '@material-ui/icons/SignalWifi0Bar';
import SignalWifi1BarIcon from '@material-ui/icons/SignalWifi1Bar';
import SignalWifi2BarIcon from '@material-ui/icons/SignalWifi2Bar';
import SignalWifi3BarIcon from '@material-ui/icons/SignalWifi3Bar';
import SignalWifi4BarIcon from '@material-ui/icons/SignalWifi4Bar';

import { AppState } from '../../store/types';
import { getInstanceInfo } from '../../store/online-instances-view/selectors';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
  text: {
    // whiteSpace: 'nowrap',
    marginLeft: theme.spacing(1),
  }
}));

const Wifi: FunctionComponent<{ instanceName: string }> = ({ instanceName }) => {
  const classes = useStyles();
  const instanceInfo = useInstanceInfo(instanceName)
  if (!instanceInfo || !instanceInfo.capabilities.includes('wifi-client')) {
    return null;
  }

  const { wifi } = instanceInfo;
  const SignalWifiIcon = getSignalWifiIcon(wifi.rssi);

  return (
    <div className={classes.container}>
      <SignalWifiIcon />
      <Typography className={classes.text}>{wifi.rssi} dBm</Typography>
    </div>
  );
};

export default Wifi;

function useInstanceInfo(instanceName: string) {
  return useSelector((appState: AppState) => getInstanceInfo(appState, instanceName));
}

function getSignalWifiIcon(rssi: number) {
  // https://www.metageek.com/training/resources/wifi-signal-strength-basics/
  if (rssi >= -30) {
    return SignalWifi4BarIcon;
  } else if (rssi >= -67) {
    return SignalWifi3BarIcon;
  } else if (rssi >= -70) {
    return SignalWifi2BarIcon;
  } else if (rssi >= -80) {
    return SignalWifi1BarIcon;
  } else {
    return SignalWifi0BarIcon;
  }
}