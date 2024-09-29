import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const Contact = () => {
  return (
    <Container maxWidth="sm">
      <Typography variant="h3" gutterBottom>
        Bienvenue sur mon portfolio !
      </Typography>
      <Typography variant="body1">
        Je suis un ingénieur QA passionné avec une expertise en Cypress et automatisation de tests.
      </Typography>
    </Container>
  );
};

export default Contact;
