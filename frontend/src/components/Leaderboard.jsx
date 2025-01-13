import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/players") // Ensure this URL matches your Flask API
      .then((response) => {
        const playersData = response.data.map((player) => ({
          id: player[0],
          name: player[1],
          elo_rating: player[2],
          wins: player[4], // Assuming wins are in the response
          losses: player[5], // Assuming losses are in the response
        }));
        setPlayers(playersData);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Elo Rating</TableCell>
              <TableCell>Wins</TableCell>
              <TableCell>Losses</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id} sx={{ height: 40 }}> 
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.elo_rating}</TableCell>
                <TableCell>{player.wins}</TableCell>
                <TableCell>{player.losses}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Leaderboard;
