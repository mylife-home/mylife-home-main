import React, { FunctionComponent, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { NamedInstanceInfo } from '../../store/online-instances-view/types';
import { getInstancesInfos } from '../../store/online-instances-view/selectors';
import Hardware from './hardware';
import Uptime from './uptime';
import ChipArray from './chip-array';
import Wifi from './wifi';
import Actions from './actions';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  noWrap: {
    whiteSpace: 'nowrap'
  }
}));

interface Sort {
  column: keyof NamedInstanceInfo;
  direction: 'asc' | 'desc';
}

const OnlineInstancesView: FunctionComponent = () => {
  const classes = useStyles();
  const [sort, setSort] = useState<Sort>({ column: 'instanceName', direction: 'asc' });
  const data = useData(sort);

  return (
    <TableContainer className={classes.root}>
      <Table stickyHeader>

        <TableHead>
          <TableRow>
            <TableHeader sort={sort} setSort={setSort} column='instanceName' title='Instance' />
            <TableHeader sort={sort} setSort={setSort} column='type' title='Type' />
            <TableHeader sort={sort} setSort={setSort} column='hostname' title={'Nom d\'hôte'} />
            <TableHeader sort={sort} setSort={setSort} column='hardware' title='Matériel' />
            <TableHeader sort={sort} setSort={setSort} column='systemUptime' title='Uptime système' />
            <TableHeader sort={sort} setSort={setSort} column='instanceUptime' title='Uptime instance' />
            <TableCell>{'Fonctionalités'}</TableCell>
            <TableCell>{'Versions'}</TableCell>
            <TableCell>{'Wifi'}</TableCell>
            <TableCell>{'Actions'}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map(instanceInfo => (
            <TableRow key={instanceInfo.instanceName}>
              <TableCell className={classes.noWrap}>{instanceInfo.instanceName}</TableCell>
              <TableCell className={classes.noWrap}>{instanceInfo.type}</TableCell>
              <TableCell className={classes.noWrap}>{instanceInfo.hostname}</TableCell>
              <TableCell className={classes.noWrap}><Hardware value={instanceInfo.hardware} /></TableCell>
              <TableCell className={classes.noWrap}><Uptime value={instanceInfo.systemUptime} /></TableCell>
              <TableCell className={classes.noWrap}><Uptime value={instanceInfo.instanceUptime} /></TableCell>
              <TableCell><ChipArray values={instanceInfo.capabilities} /></TableCell>
              <TableCell><ChipArray values={Object.entries(instanceInfo.versions).map(([name, version]) => `${name}: ${version}`)} /></TableCell>
              <TableCell className={classes.noWrap}><Wifi instanceName={instanceInfo.instanceName} /></TableCell>
              <TableCell className={classes.noWrap}><Actions instanceName={instanceInfo.instanceName} /></TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </TableContainer>
  );
};

export default OnlineInstancesView;

interface TableHeaderProps {
  column: keyof NamedInstanceInfo;
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

function useData(sort: Sort) {
  const data = useSelector(getInstancesInfos);

  return useMemo(() => {
    const comparator = getComparator(sort);
    const sorted = [ ...data ];
  
    sorted.sort(comparator);
  
    return sorted;
  }, [data, sort]);
}

function getComparator(sort: Sort): (a: NamedInstanceInfo, b: NamedInstanceInfo) => number {
  const { column, direction } = sort;
  return direction === 'asc'
    ? (a, b) => compare(a[column], b[column])
    : (a, b) => -compare(a[column], b[column]);
}

function compare<T>(a: T, b: T) {
  if (Object.is(a, b)) {
    return 0;
  }

  return a === null || a === undefined || a < b ? -1 : 1;
}
