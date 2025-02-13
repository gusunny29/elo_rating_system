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
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Players = ({ setSelectedPlayers }) => {
  const [players, setPlayers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch players from backend (without the 'is_playing' field)
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/players")
      .then((response) => {

        const storedPlayers = JSON.parse(localStorage.getItem("selectedPlayers")) || [];
        // Initialize the 'is_playing' state locally
        const playersData = response.data.map((player) => ({
          id: player[0],
          name: player[1],
          elo_rating: player[2],
          is_playing: storedPlayers.some((p) => p.id === player[0]), // Set this to false initially
        }));
        setPlayers(playersData);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedPlayers", JSON.stringify(players.filter((p) => p.is_playing)));
  }, [players]);

  // Handle checkbox change
  const handleCheckboxChange = (id, checked) => {
    const updatedPlayers = players.map((player) =>
      player.id === id ? { ...player, is_playing: checked } : player
    );
    setPlayers(updatedPlayers); // Update state
    setSelectedPlayers(updatedPlayers.filter((player) => player.is_playing)); // Update selected players
  };

  // Handle delete
  const handleDelete = (id) => {
    axios
      .delete(`http://127.0.0.1:5000/api/players/${id}`)
      .then(() => {
        const updatedPlayers = players.filter((player) => player.id !== id);
        setPlayers(updatedPlayers);
        setSelectedPlayers(updatedPlayers.filter((player) => player.is_playing));
        localStorage.setItem("selectedPlayers", JSON.stringify(updatedPlayers.filter((p) => p.is_playing)));
        setOpen(false);
      })
      .catch((error) => {
        console.error("Error deleting player:", error);
      });
  };

  // Open the delete confirmation dialog
  const handleClickOpen = (player) => {
    setSelectedPlayer(player);
    setOpen(true);
  };

  // Close the delete confirmation dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedPlayer(null);
  };

  // Handle 'Select All' functionality
  const handleSelectAll = () => {
    const newSelectAllState = !selectAll;
    setSelectAll(newSelectAllState);

    const updatedPlayers = players.map((player) => ({
      ...player,
      is_playing: newSelectAllState, // Update 'is_playing' based on selectAll
    }));
    setPlayers(updatedPlayers); // Update state
    setSelectedPlayers(updatedPlayers.filter((player) => player.is_playing)); // Update selected players
    localStorage.setItem("selectedPlayers", JSON.stringify(updatedPlayers.filter((p) => p.is_playing)));

  };

  // Render table headers
  const renderTableHeaders = () => (
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Elo Rating</TableCell>
        <TableCell>Playing</TableCell>
        <TableCell>Delete</TableCell>
      </TableRow>
    </TableHead>
  );

  // Render table rows for each player
  const renderPlayerRows = () => (
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
          <TableCell>
            <IconButton onClick={() => handleClickOpen(player)} color="error">
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  // Render delete confirmation dialog
  const renderDeleteDialog = () => (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to delete {selectedPlayer?.name}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => handleDelete(selectedPlayer.id)}
          color="error"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render select all button
  const renderSelectAllButton = () => (
    <Button
      variant="outlined"
      onClick={handleSelectAll}
      style={{ marginBottom: "16px" }}
    >
      {selectAll ? "Deselect All" : "Select All"}
    </Button>
  );

  return (
    <div>
      <Typography variant="h6">Player Rankings</Typography>

      {/* Select All Button */}
      {renderSelectAllButton()}

      <TableContainer component={Paper}>
        <Table>
          {renderTableHeaders()}
          {renderPlayerRows()}
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      {renderDeleteDialog()}
    </div>
  );
};

export default Players;
