import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { getInstancesInfos } from '../../store/online-instances-view/selectors';

// TODO: sort
// TODO: uptime control (nullable)
// TODO: display capabilities
// TODO: display versions

interface Sort {
  column: string;
  direction: 'asc' | 'desc';
}

const OnlineInstancesView: FunctionComponent = () => {
  const { data } = useConnect();

  const [sort, setSort] = useState<Sort>({ column: 'instanceName', direction: 'asc' });

  return (
    <TableContainer>
      <Table>

        <TableHead>
          <TableRow>
            <TableHeader sort={sort} setSort={setSort} column='instanceName' title='Instance' />
            <TableHeader sort={sort} setSort={setSort} column='type' title='Type' />
            <TableHeader sort={sort} setSort={setSort} column='hostname' title={'Nom d\'hôte'} />
            <TableHeader sort={sort} setSort={setSort} column='hardware' title='Matériel' />
            <TableHeader sort={sort} setSort={setSort} column='systemBootTime' title='Uptime système' />
            <TableHeader sort={sort} setSort={setSort} column='instanceBootTime' title='Uptime instance' />
            <TableHeader sort={sort} setSort={setSort} column='capabilities' title='Fonctionalités' />
            <TableHeader sort={sort} setSort={setSort} column='versions' title='Versions' />
          </TableRow>
        </TableHead>

        <TableBody>
          {Object.entries(data).map(([instanceName, instanceInfo]) => (
            <TableRow key={instanceName}>
              <TableCell>{instanceName}</TableCell>
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

interface TableHeaderProps {
  column: string;
  title: string;
  sort: Sort;
  setSort: (newSort: Sort) => void;
}

const TableHeader: FunctionComponent<TableHeaderProps> = ({ column, title, sort, setSort }) => {
  const onClick = () => {
    const isAsc = sort.column === column && sort.direction === 'asc';
    setSort({ column, direction: isAsc ? 'desc' : 'asc' });
  };

  return (
    <TableCell sortDirection={sort.column === column ? sort.direction : false}>
      <TableSortLabel active={sort.column === column} direction={sort.column === column ? sort.direction : undefined} onClick={onClick}>
        {title}
      </TableSortLabel>
    </TableCell>
  );
};
