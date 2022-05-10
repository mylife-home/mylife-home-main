import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Title } from '../../../lib/main-view-layout';
import { TemplateIcon } from '../../../lib/icons';
import { AppState } from '../../../../store/types';
import { getTemplate } from '../../../../store/ui-designer/selectors';
import { TemplateActions } from '../common/template-actions';

const useStyles = makeStyles((theme) => ({
  titleActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

const Template: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const template = useSelector((state: AppState) => getTemplate(state, id));

  return (
    <Container
      title={
        <>
          <Title text={`Template ${template.templateId}`} icon={TemplateIcon} />

          <div className={classes.titleActions}>
            <TemplateActions id={id} />
          </div>
        </>
      }
    >
      TODO
    </Container>
  );
};

export default Template;
