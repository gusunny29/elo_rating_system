import React, { useState, useEffect } from "react";
import AddPlayer from "./AddPlayer";
import Players from "./Players";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import axios from "axios";

const PlayerManagement = ({ setSelectedPlayers }) => {
  const [players, setPlayers] = useState([]);

  // Function to fetch players
  const refreshPlayers = () => {
    axios
      .get("http://127.0.0.1:5000/api/players")
      .then((response) => {
        const playersData = response.data.map((player) => ({
          id: player[0],
          name: player[1],
          elo_rating: player[2],
          is_playing: false,
        }));
        setPlayers(playersData); // Update players state
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  };

  // Fetch players when component mounts
  useEffect(() => {
    refreshPlayers();
  }, []);

  return (
    <div>
      <Typography variant="h3">Player Management</Typography>
      {/* Pass refreshPlayers function to AddPlayer */}
      <AddPlayer refreshPlayers={refreshPlayers} />
      {/* Pass players list and refreshPlayers to Players */}
      <Players players={players} setSelectedPlayers={setSelectedPlayers} refreshPlayers={refreshPlayers} setPlayers = {setPlayers}/>
      <Link to="/matchday-dashboard">
        <Button variant="contained" color="primary" style={{ marginTop: "20px" }}>
          Go to Matchday Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default PlayerManagement;
