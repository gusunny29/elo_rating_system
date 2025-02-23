import React, { useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";



const AddPlayer = ({ refreshPlayers }) => {
  const [name, setName] = useState("");
  const [eloRating, setEloRating] = useState(0.0);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://127.0.0.1:5000/api/players", {
        name,
        elo_rating: eloRating,
        wins: 0,
        losses: 0
      })
      .then((response) => {
        alert(`Player ${response.data.name} added with Elo rating of ${response.data.elo_rating}!`);
        setName("");
        setEloRating(0.0); // Reset the form
        refreshPlayers(); // Fetch updated players list
      })
      .catch((error) => {
        console.error("There was an error adding the player!", error);
      });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField
        label="Player Name"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Elo Rating"
        variant="outlined"
        fullWidth
        type="number"
        value={eloRating}
        onChange={(e) => setEloRating(parseFloat(e.target.value))}
        required
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary">
        Add Player
      </Button>
    </Box>
  );
};

export default AddPlayer;

