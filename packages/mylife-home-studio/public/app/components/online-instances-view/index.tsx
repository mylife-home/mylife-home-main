import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { getInstancesInfos } from '../../store/online-instances-view/selectors';

// TODO: sort
// TODO: uptime control (nullable)
// TODO: display capabilities
// TODO: display versions

const OnlineInstancesView: FunctionComponent = () => {
  const { data } = useConnect();
  return (
    <TableContainer>
      <Table>

        <TableHead>
          <TableRow>
            <TableCell>Instance</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Nom d'hôte</TableCell>
            <TableCell>Matériel</TableCell>
            <TableCell>Uptime système</TableCell>
            <TableCell>Uptime instance</TableCell>
            <TableCell>Fonctionalités</TableCell>
            <TableCell>Versions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {Object.entries(data).map(([instanceName, instanceInfo]) => (
            <TableRow key={instanceName}>
              <TableCell component="th" scope="row">
                {instanceName}
              </TableCell>
              <TableCell>{instanceInfo.type}</TableCell>
              <TableCell>{instanceInfo.hostname}</TableCell>
              <TableCell>{instanceInfo.hardware}</TableCell>
              <TableCell>{instanceInfo.systemBootTime.toString()}</TableCell>
              <TableCell>{instanceInfo.instanceBootTime.toString()}</TableCell>
              <TableCell>{JSON.stringify(instanceInfo.capabilities)}</TableCell>
              <TableCell>{JSON.stringify(instanceInfo.versions)}</TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </TableContainer>
  );
};

export default OnlineInstancesView;

function useConnect() {
  return {
    data: useSelector(getInstancesInfos)
  };
}
