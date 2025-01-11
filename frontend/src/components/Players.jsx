import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Players = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/players") // Ensure this URL matches your Flask API
      .then((response) => {
        const playersData = response.data.map((player) => ({
          id: player[0],
          name: player[1],
          elo_rating: player[2],
          is_playing: player[3], // Assume the "Playing" data is included in the response
        }));
        setPlayers(playersData);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, []);

  const handleCheckboxChange = (id, checked) => {
    const updatedPlayers = players.map((player) =>
      player.id === id ? { ...player, is_playing: checked } : player
    );
    setPlayers(updatedPlayers);

    // Update the "Playing" status in the backend if necessary
    axios
      .put(`http://127.0.0.1:5000/api/players/${id}`, { is_playing: checked })
      .catch((error) => {
        console.error("Error updating player status:", error);
      });
  };

  return (
    <div>
      <h1>Player Rankings</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Elo Rating</TableCell>
              <TableCell>Playing</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.elo_rating}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={player.is_playing}
                    onChange={(e) =>
                      handleCheckboxChange(player.id, e.target.checked)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Players;
