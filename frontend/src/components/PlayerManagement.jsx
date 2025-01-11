import React, { useState } from 'react';
import axios from 'axios';
import AddPlayer from './AddPlayer';
import Players from './Players';

const PlayerManagement = () => {
  
  return (
    <div> 
      <AddPlayer/>
      <Players/>
    </div>
  )

}
export default PlayerManagement;