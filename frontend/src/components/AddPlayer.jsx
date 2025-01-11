import React, { useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const AddPlayer = () => {
  const [name, setName] = useState("");
  const [eloRating, setEloRating] = useState(0.0);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Make a POST request to add a new player
    axios
      .post("http://127.0.0.1:5000/api/players", {
        name,
        elo_rating: eloRating,
      })
      .then((response) => {
        alert(
          `Player ${response.data.name} added with Elo rating of ${response.data.elo_rating}!`
        );
        setName("");
        setEloRating(0.0); // Reset the form after submission
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
