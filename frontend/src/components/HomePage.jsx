import React from 'react';
import { Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.primary.main,
    textAlign: 'center',
  },
  card: {
    background: theme.palette.secondary.main,
    padding: theme.spacing(4),
    boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    transition: 'transform 0.3s'

  },
  button: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    padding: theme.spacing(2, 4),
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },
  title: {
    marginBottom: theme.spacing(3),
    fontSize: '2.5rem',
    fontWeight: 700,
  },
  subtitle: {
    marginBottom: theme.spacing(4),
    fontSize: '1.2rem',
    fontWeight: 500,
  },
}));

const HomePage = () => {
  const classes = useStyles();

  return (
    <div >
      <Container>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h3" className={classes.title}>
              Welcome to the ELO
            </Typography>
            <Typography variant="h5" className={classes.subtitle}>
              Track player rankings, manage players, and view the leaderboard all in one place.
            </Typography>
            <Grid container justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  className={classes.button}
                  component={Link}
                  to="/player-management"
                >
                  Go to Player Management
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default HomePage;
