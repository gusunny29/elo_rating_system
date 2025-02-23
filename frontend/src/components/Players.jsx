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
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Players = ({ players, setSelectedPlayers, refreshPlayers, setPlayers  }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editPlayerData, setEditPlayerData] = useState({ name: "", elo_rating: "" });
  const [selectAll, setSelectAll] = useState(false);

  // Fetch players from backend (without the 'is_playing' field)
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/players")
      .then((response) => {
        const playersData = response.data.map((player) => ({
          id: player[0],
          name: player[1],
          elo_rating: player[2],
          is_playing: false,
        }));
        setPlayers(playersData);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, [setPlayers]);

  // Handle checkbox change
  const handleCheckboxChange = (id, checked) => {
    const updatedPlayers = players.map((player) =>
      player.id === id ? { ...player, is_playing: checked } : player
    );
    setPlayers(updatedPlayers);
    setSelectedPlayers(updatedPlayers.filter((player) => player.is_playing));
  };

  // Open the delete confirmation dialog
  const handleClickOpenDelete = (player) => {
    setSelectedPlayer(player);
    setOpenDelete(true);
  };

  // Close the delete confirmation dialog
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedPlayer(null);
  };

  // Handle delete player
  const handleDelete = (id) => {
    axios
      .delete(`http://127.0.0.1:5000/api/players/${id}`)
      .then(() => {
        setPlayers(players.filter((player) => player.id !== id));
        setOpenDelete(false);
        refreshPlayers();
      })
      .catch((error) => {
        console.error("Error deleting player:", error);
      });
  };

  // Open edit player dialog
  const handleClickOpenEdit = (player) => {
    setSelectedPlayer(player);
    setEditPlayerData({ name: player.name, elo_rating: player.elo_rating });
    setOpenEdit(true);
  };

  // Close edit player dialog
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedPlayer(null);
  };

  // Handle edit input changes
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditPlayerData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle player update (PATCH request)
  const handleUpdatePlayer = () => {
    if (!selectedPlayer) return;

    axios
      .patch(`http://127.0.0.1:5000/api/players/${selectedPlayer.id}`, editPlayerData)
      .then(() => {
        const updatedPlayers = players.map((player) =>
          player.id === selectedPlayer.id
            ? { ...player, ...editPlayerData }
            : player
        );
        setPlayers(updatedPlayers);
        refreshPlayers();
        setOpenEdit(false);
      })
      .catch((error) => {
        console.error("Error updating player:", error);
      });
  };

  // Handle 'Select All' functionality
  const handleSelectAll = () => {
    const newSelectAllState = !selectAll;
    setSelectAll(newSelectAllState);

    const updatedPlayers = players.map((player) => ({
      ...player,
      is_playing: newSelectAllState,
    }));
    setPlayers(updatedPlayers);
    setSelectedPlayers(updatedPlayers.filter((player) => player.is_playing));
  };

  return (
    <div>
      <Typography variant="h6">Player Rankings</Typography>

      {/* Select All Button */}
      <Button
        variant="outlined"
        onClick={handleSelectAll}
        style={{ marginBottom: "16px" }}
      >
        {selectAll ? "Deselect All" : "Select All"}
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Elo Rating</TableCell>
              <TableCell>Playing</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
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
                    onChange={(e) => handleCheckboxChange(player.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleClickOpenEdit(player)} color="primary">
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleClickOpenDelete(player)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {selectedPlayer?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDelete(selectedPlayer.id)} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Player Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Player</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            value={editPlayerData.name}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Elo Rating"
            name="elo_rating"
            type="number"
            value={editPlayerData.elo_rating}
            onChange={handleEditChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdatePlayer} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Players;
