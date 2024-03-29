import React, { FunctionComponent, useState } from 'react';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SvgIcon from '@material-ui/core/SvgIcon';
import CachedIcon from '@material-ui/icons/Cached';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

import { AsyncDispatch } from '../../../store/types';
import { gitRefresh } from '../../../store/git/actions';
import { getGitBranch, getGitChangedFeatures, getGitCommitsCount } from '../../../store/git/selectors';
import { useFireAsync } from '../../lib/use-error-handling';
import { StatusItem, StatusButton } from '../../lib/status-bar';
import { useShowGitDialog } from './git-dialog';

const useStyles = makeStyles((theme) => ({
  gitIcon: {
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(1)
  },
  commitsButtonSeparator: {
    width: theme.spacing(2)
  },
  '@keyframes rotate': {
    to: { transform: 'rotate(360deg)' }
  },
  refreshing: {
    animation: '$rotate 1.5s linear infinite'
  }
}));

const Git: FunctionComponent = () => {
  const classes = useStyles();
  const branch = useSelector(getGitBranch);
  const changedFeatures = useSelector(getGitChangedFeatures);
  const showGitDialog = useShowGitDialog();

  let text = branch;
  if(changedFeatures.length > 0) {
    text += ` (changes on ${changedFeatures.join(', ')})`
  }

  return (
    <StatusItem>
      <StatusButton onClick={showGitDialog}>
        <GitBranchIcon className={classes.gitIcon} />
        <Typography>{text}</Typography>
      </StatusButton>

      <GitRefreshButton />
    </StatusItem>
  );
};

export default Git;

// from https://github.com/microsoft/vscode-icons/blob/main/icons/light/source-control.svg
const GitBranchIcon = createSvgIcon(
  <path d="M21.007 8.22168C21.0105 7.52792 20.8207 6.84689 20.4591 6.25485C20.0974 5.66281 19.578 5.18315 18.9592 4.86957C18.3403 4.556 17.6463 4.42091 16.9551 4.47941C16.2637 4.53793 15.6025 4.78773 15.045 5.20085C14.4877 5.61397 14.0563 6.17409 13.7993 6.8185C13.5424 7.4629 13.4697 8.16613 13.5898 8.84944C13.7099 9.53274 14.0177 10.1692 14.4789 10.6874C14.9402 11.2056 15.5367 11.5852 16.2015 11.7836C15.956 12.2824 15.5763 12.703 15.1049 12.9979C14.6336 13.2929 14.0894 13.4505 13.5334 13.4532H10.544C9.43726 13.4571 8.37163 13.8727 7.55451 14.6191V7.39809C8.46184 7.21288 9.26808 6.69737 9.81692 5.95151C10.3658 5.20565 10.6181 4.28256 10.525 3.36121C10.4319 2.43987 10.0001 1.5859 9.31316 0.964873C8.62624 0.343845 7.73319 0 6.80716 0C5.88112 0 4.98807 0.343845 4.30114 0.964873C3.61422 1.5859 3.18236 2.43987 3.08928 3.36121C2.9962 4.28256 3.24855 5.20565 3.79739 5.95151C4.34623 6.69737 5.15247 7.21288 6.0598 7.39809V16.5159C5.15418 16.6891 4.34323 17.1877 3.77993 17.9176C3.21663 18.6476 2.93992 19.5585 3.00197 20.4785C3.06403 21.3984 3.46057 22.2639 4.1168 22.9115C4.77303 23.5592 5.6436 23.9444 6.56427 23.9944C7.48496 24.0445 8.39211 23.7558 9.11464 23.183C9.83718 22.6102 10.3251 21.7928 10.4865 20.885C10.6478 19.9771 10.4714 19.0417 9.99048 18.255C9.50957 17.4683 8.75741 16.8848 7.87588 16.6145C8.12176 16.1162 8.50167 15.6963 8.97296 15.4019C9.44426 15.1074 9.98827 14.9503 10.544 14.9479H13.5334C14.4661 14.9436 15.3742 14.6486 16.1313 14.1039C16.8884 13.5592 17.4568 12.792 17.7575 11.9091C18.6534 11.7914 19.4763 11.3528 20.0738 10.6748C20.6713 9.9968 21.0028 9.12533 21.007 8.22168ZM4.56508 3.73752C4.56508 3.29408 4.69657 2.8606 4.94293 2.4919C5.1893 2.12319 5.53947 1.83581 5.94915 1.66611C6.35884 1.49642 6.80965 1.45202 7.24456 1.53854C7.67948 1.62504 8.07898 1.83857 8.39254 2.15214C8.70611 2.4657 8.91964 2.8652 9.00615 3.30012C9.09266 3.73504 9.04827 4.18585 8.87857 4.59553C8.70887 5.00521 8.42149 5.35539 8.05278 5.60175C7.68408 5.84811 7.2506 5.9796 6.80716 5.9796C6.21252 5.9796 5.64224 5.74339 5.22177 5.32291C4.80129 4.90245 4.56508 4.33216 4.56508 3.73752ZM9.04923 20.1794C9.04923 20.6229 8.91774 21.0563 8.67138 21.425C8.42501 21.7937 8.07485 22.0811 7.66516 22.2508C7.25547 22.4205 6.80466 22.4649 6.36975 22.3784C5.93483 22.292 5.53533 22.0784 5.22177 21.7648C4.90821 21.4512 4.69467 21.0517 4.60816 20.6169C4.52165 20.1819 4.56605 19.7311 4.73575 19.3214C4.90545 18.9117 5.19282 18.5615 5.56153 18.3152C5.93023 18.0689 6.36371 17.9373 6.80716 17.9373C7.40179 17.9373 7.97207 18.1736 8.39254 18.594C8.81302 19.0145 9.04923 19.5848 9.04923 20.1794ZM17.2702 10.4638C16.8267 10.4638 16.3933 10.3322 16.0246 10.0859C15.6559 9.83954 15.3685 9.48937 15.1988 9.07969C15.0291 8.67 14.9847 8.2192 15.0712 7.78427C15.1576 7.34935 15.3712 6.94985 15.6848 6.63629C15.9984 6.32273 16.3979 6.10919 16.8327 6.02268C17.2677 5.93617 17.7185 5.98058 18.1281 6.15027C18.5379 6.31997 18.8881 6.60734 19.1344 6.97605C19.3807 7.34476 19.5123 7.77823 19.5123 8.22168C19.5123 8.81632 19.276 9.3866 18.8556 9.80706C18.4351 10.2275 17.8648 10.4638 17.2702 10.4638Z" />,
  'GitBranchIcon'
);

// https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/utils/createSvgIcon.js
function createSvgIcon(path: any, displayName: string): typeof SvgIcon {
  const Component = (props: any, ref: any) => (
    <SvgIcon ref={ref} {...props}>
      {path}
    </SvgIcon>
  );

  Component.displayName = `${displayName}Icon`;
  return React.memo(React.forwardRef(Component));
}

const GitRefreshButton: FunctionComponent = () => {
  const classes = useStyles();
  const { ahead, behind } = useSelector(getGitCommitsCount);
  const [refreshing, setRefreshing] = useState(false);
  const fireAsync = useFireAsync();
  const dispatch = useDispatch<AsyncDispatch>();

  const showCommitsCount = !!ahead || !!behind;

  const handleRefresh = () => {
    if (refreshing) {
      return;
    }

    fireAsync(async () => {
      setRefreshing(true);
      try {
        await dispatch(gitRefresh());
      } finally {
        setRefreshing(false);
      }
    });
  };

  return (
    <StatusButton onClick={handleRefresh}>
      <CachedIcon className={clsx({ [classes.refreshing]: refreshing })} />

      {showCommitsCount && (
        <>
          <div className={classes.commitsButtonSeparator} />

          <Typography>{`${behind}`}</Typography>
          <ArrowDownwardIcon />

          <div className={classes.commitsButtonSeparator} />

          <Typography>{`${ahead}`}</Typography>
          <ArrowUpwardIcon />
        </>
      )}
    </StatusButton>
  );
};