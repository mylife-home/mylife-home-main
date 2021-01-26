import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Container, Title } from '../../lib/main-view-layout';
import { ComponentIcon, StateIcon, ActionIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { getComponentsIds, getComponentAndPlugin } from '../../../store/ui-designer/selectors';
import { Member, MemberType } from '../../../../../shared/component-model';

const useStyles = makeStyles((theme) => ({
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
        <Title text="Composants" icon={ComponentIcon} />
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
