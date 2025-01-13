import React, { useState } from 'react';
import axios from 'axios';
import AddPlayer from './AddPlayer';
import Players from './Players';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from'react-router-dom';

const PlayerManagement = ({setSelectedPlayers}) => {
  
  return (
    <div> 
      <Typography variant="h3">Player Management</Typography>
      <AddPlayer/>
      <Players setSelectedPlayers={setSelectedPlayers}/>
       <Link to="/matchday-dashboard">
        <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Go to Matchday Dashboard
        </Button>
      </Link>
    </div>
  )

}
export default PlayerManagement;