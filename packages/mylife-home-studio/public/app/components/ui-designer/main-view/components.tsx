import React, { FunctionComponent, useState } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Container, Title } from '../../lib/main-view-layout';
import { ProjectIcon, ComponentIcon, InstanceIcon, StateIcon, ActionIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { getComponentsIds, getComponentAndPlugin } from '../../../store/ui-designer/selectors';
import { Member, MemberType } from '../../../../../shared/component-model';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  badge: {
    background: null,
    color: darken(theme.palette.background.paper, 0.4),
  },
  badgeIcon: {
    height: 12,
    width: 12,
  },
  list: {
    width: 500,
    overflowY: 'auto',
  },
  componentContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  componentId: {
    width: 200,
  },
  componentDescription: {
    width: 200,
    marginLeft: theme.spacing(4),
  },
  members: {
    display: 'flex',
    flexDirection: 'column',
  },
  memberContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  memberName: {
    width: 80,
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  memberValueType: {
    width: 200,
  },
}));

const Components: FunctionComponent = () => {
  const classes = useStyles();
  const componentsIds = useTabSelector(getComponentsIds);
  const [selection, setSelection] = useState<string>(null);
  
  const createSelectHandler = (id: string) => () => {
    setSelection(selection => selection === id ? null : id);
  };

  return (
    <Container
      title={
        <>
          <Title text="Composants" icon={ComponentIcon} />
  
          <Tooltip title="Rafraîchir les composants depuis un projet core">
            <IconButton onClick={() => console.log('TODO')}>
              <Badge badgeContent={<ProjectIcon className={classes.badgeIcon} />} classes={{badge: classes.badge}}>
                <ComponentIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Rafraîchir les composants depuis les instances en ligne">
            <IconButton onClick={() => console.log('TODO')}>
              <Badge badgeContent={<InstanceIcon className={classes.badgeIcon} />} classes={{badge: classes.badge}}>
                <ComponentIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <div className={classes.list}>
        {componentsIds.map((id) => (
          <ComponentItem key={id} id={id} selected={id === selection} select={createSelectHandler(id)} />
        ))}
      </div>
    </Container>
  );
};

export default Components;

const ComponentItem: FunctionComponent<{ id: string; selected: boolean; select: () => void; }> = ({ id, selected, select }) => {
  const classes = useStyles();
  const { component, plugin } = useTabSelector((state, tabId) => getComponentAndPlugin(state, tabId, id));
  const text = plugin.description ? `${plugin.id} - ${plugin.description}` : plugin.id;

  return (
    <Accordion expanded={selected} onChange={select}>

      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className={classes.componentContainer}>
          <Typography className={classes.componentId}>{component.id}</Typography>
          <Typography className={classes.componentDescription} variant="body2" color="textSecondary">{text}</Typography>
        </div>
      </AccordionSummary>

      <AccordionDetails className={classes.members}>
        {Object.entries(plugin.members).map(([id, member]) => (
          <ComponentMember key={id} id={id} member={member} />
        ))}
      </AccordionDetails>
    </Accordion>
  )
};

const MEMBER_ICON = {
  [MemberType.STATE]: StateIcon,
  [MemberType.ACTION]: ActionIcon,
};

const ComponentMember: FunctionComponent<{ id: string, member: Member }> = ({ id, member }) => {
  const classes = useStyles();
  const Icon = MEMBER_ICON[member.memberType];
  return (
    <div className={classes.memberContainer}>
      <Icon />
      <Typography className={classes.memberName}>{id}</Typography>
      <Typography className={classes.memberValueType} variant="body2" color="textSecondary">{member.valueType}</Typography>
    </div>
  );
};
