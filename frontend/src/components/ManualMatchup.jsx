import React, { useState } from "react";
import axios from "axios";
import { Button, Typography, Box, Card, CardContent, TextField } from "@mui/material";

const getPlayerELO = (player) => player.elo_rating || 1200;

const K = 30;

const recordMatchResult = async(matchData) => {
  // Make a POST request to the server to record the match result
  try {
    await axios.post("http://127.0.0.1:5000/api/matches", matchData);
    console.log("Match recorded successfully.");
  } catch (error) {
    console.error("Error recording match result:", error);
  }
}

const ManualMatchup = ({ selectedPlayers }) => {
  const [manualMatchups, setManualMatchups] = useState(() => {
    const storedMatchups = JSON.parse(localStorage.getItem("manualMatchups"));
    return storedMatchups || [];
  });
  const [selectedManualPlayers, setSelectedManualPlayers] = useState([]);
  const [usedPlayers, setUsedPlayers] = useState(new Set()); // Track players used in matchups
  const [players, setPlayers] = useState(selectedPlayers);

  const createManualMatchup = () => {
    if (selectedManualPlayers.length !== 4) return;

    const team1 = [selectedManualPlayers[0], selectedManualPlayers[1]];
    const team2 = [selectedManualPlayers[2], selectedManualPlayers[3]];

    const newMatchup = {
      team1: team1.map(p => ({ name: p.name, id: p.id, elo_rating: getPlayerELO(p) })),
      team2: team2.map(p => ({ name: p.name, id: p.id, elo_rating: getPlayerELO(p) })),
      team1Score: ["", "", ""],
      team2Score: ["", "", ""],
      winner: ""
    };

    const updatedMatchups = [...manualMatchups, newMatchup];
    setManualMatchups(updatedMatchups);

    // Mark players as "used"
    setUsedPlayers(new Set([...usedPlayers, ...selectedManualPlayers.map(p => p.id)]));

    // Reset selection
    setSelectedManualPlayers([]);

    // Save to localStorage
    localStorage.setItem("manualMatchups", JSON.stringify(updatedMatchups));
  };


  const handleScoreChange = (index, team, set, value) => {
    const updatedMatchups = [...manualMatchups];
    if (team === "team1") {
      updatedMatchups[index].team1Score[set] = value;
    } else {
      updatedMatchups[index].team2Score[set] = value;
    }
    setManualMatchups(updatedMatchups);
  };

  const updatePlayerELOInDatabase = (playerId, newEloRating) => {
    axios
      .post("http://127.0.0.1:5000/api/updateElo", {
        playerId: playerId,
        elo_rating: newEloRating
      })
      .then((response) => {
        console.log("Player ELO updated: ${response.data}");
        // Optionally update the state or perform any other action
      })
      .catch((error) => {
        console.error("Error updating player ELO:", error);
      });
  };

  const handleSubmitMatchResult = async (index) => {
    const updatedMatchups = [...manualMatchups];
    const matchup = updatedMatchups[index];

    // Calculate total scores
    const team1Score = matchup.team1Score.reduce((a, b) => parseInt(a || 0) + parseInt(b || 0), 0);
    const team2Score = matchup.team2Score.reduce((a, b) => parseInt(a || 0) + parseInt(b || 0), 0);

    // Determine winner & loser
    const winner = team1Score > team2Score ? "team1" : "team2";
    const loser = winner === "team1" ? "team2" : "team1";

    // Extract team members
    const team1 = matchup.team1;
    const team2 = matchup.team2;

    // Calculate average ELO of opponents
    const avgELO_team1 = (getPlayerELO(team1[0]) + getPlayerELO(team1[1])) / 2;
    const avgELO_team2 = (getPlayerELO(team2[0]) + getPlayerELO(team2[1])) / 2;

    // Function to calculate new ELO based on your formula
    const calculateNewELO = (playerELO, avgOpponentELO, isWinner) => {
      const adjustment = (K * avgOpponentELO) / playerELO;
      return isWinner ? playerELO + adjustment : playerELO - adjustment;
    };

    // Update ELOs for all players
    const updatedPlayers = selectedPlayers.map((player) => {
      const isTeam1Player = team1.some(p => p.name === player.name);
      const isTeam2Player = team2.some(p => p.name === player.name);

      let newELO = getPlayerELO(player);
      const oldELO = newELO;

      if (isTeam1Player) {
        newELO = calculateNewELO(newELO, avgELO_team2, winner === "team1");
      } else if (isTeam2Player) {
        newELO = calculateNewELO(newELO, avgELO_team1, winner === "team2");
      }

      updatePlayerELOInDatabase(player.id, newELO);

      return { ...player, elo_rating: newELO, elo_before: oldELO };
    });

    // Helper function to get updated ELO
    const getUpdatedELO = (name) => updatedPlayers.find(p => p.name === name).elo_rating;
    const getPreELO = (name) => updatedPlayers.find(p => p.name === name).elo_before;

    // Format match data for the backend
    const matchData = {
      team1_player1: matchup.team1[0].name,
      team1_player2: matchup.team1[1].name,
      team2_player1: matchup.team2[0].name,
      team2_player2: matchup.team2[1].name,
      match_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      team1_g1_score: parseInt(matchup.team1Score[0]) || null,
      team2_g1_score: parseInt(matchup.team2Score[0]) || null,
      team1_g2_score: parseInt(matchup.team1Score[1]) || null,
      team2_g2_score: parseInt(matchup.team2Score[1]) || null,
      team1_g3_score: parseInt(matchup.team1Score[2]) || null,
      team2_g3_score: parseInt(matchup.team2Score[2]) || null,
      winner: winner === "team1" ? `${matchup.team1[0].name}, ${matchup.team1[1].name}` 
              : `${matchup.team2[0].name}, ${matchup.team2[1].name}`,
      // Store Pre/Post ELO for all players
      player_1_pre_elo: getPreELO(matchup.team1[0].name),
      player_2_pre_elo: getPreELO(matchup.team1[1].name),
      player_3_pre_elo: getPreELO(matchup.team2[0].name),
      player_4_pre_elo: getPreELO(matchup.team2[1].name),
      player_1_post_elo: getUpdatedELO(matchup.team1[0].name),
      player_2_post_elo: getUpdatedELO(matchup.team1[1].name),
      player_3_post_elo: getUpdatedELO(matchup.team2[0].name),
      player_4_post_elo: getUpdatedELO(matchup.team2[1].name),
    };

    await recordMatchResult(matchData);

    // Update matchups state
    updatedMatchups[index].winner = winner;
    setPlayers(updatedPlayers);

    localStorage.setItem("manualMatchups", JSON.stringify(updatedMatchups));

    setManualMatchups(updatedMatchups);
  };

  const resetAllMatchups = () => {
    setManualMatchups([]); // Clear all matchups
    setSelectedManualPlayers([]); // Reset selected players
    setUsedPlayers(new Set()); // Reset disabled players
  };

  const resetSingleMatchup = (index) => {
    const matchupToRemove = manualMatchups[index];

    // Remove the selected matchup
    const updatedMatchups = manualMatchups.filter((_, i) => i !== index);

    // Free up the players from the matchup
    const updatedUsedPlayers = new Set(usedPlayers);
    matchupToRemove.team1.forEach(player => updatedUsedPlayers.delete(player.id));
    matchupToRemove.team2.forEach(player => updatedUsedPlayers.delete(player.id));

    setManualMatchups(updatedMatchups);
    setUsedPlayers(updatedUsedPlayers);
  };

  return (
    <Box>
      <Typography variant="h6">Select Players for Manual Matchup:</Typography>
      
      {/* Player Selection */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {selectedPlayers.map((player) => (
          <Button
            key={player.id}
            variant={selectedManualPlayers.includes(player) ? "contained" : "outlined"}
            color={usedPlayers.has(player.id) ? "secondary" : "primary"}
            disabled={usedPlayers.has(player.id)}
            onClick={() => {
              if (selectedManualPlayers.includes(player)) {
                setSelectedManualPlayers(selectedManualPlayers.filter((p) => p.id !== player.id));
              } else if (selectedManualPlayers.length < 4) {
                setSelectedManualPlayers([...selectedManualPlayers, player]);
              }
            }}
          >
            {player.name} (ELO: {getPlayerELO(player)})
          </Button>
        ))}
      </Box>

      {/* Create Matchup Button */}
      <Button
        variant="contained"
        color="success"
        disabled={selectedManualPlayers.length !== 4}
        onClick={createManualMatchup}
      >
        Create Matchup
      </Button>

      {/* Reset All Matchups Button */}
      <Button
        variant="outlined"
        color="error"
        sx={{ marginLeft: "16px" }}
        onClick={resetAllMatchups}
      >
        Reset All Matchups
      </Button>

      {/* Display Manual Matchups */}
      {manualMatchups.length > 0 && (
        <Box sx={{ marginTop: "24px" }}>
          <Typography variant="h6">Manual Matchups:</Typography>
          {manualMatchups.map((matchup, index) => (
            <Card key={index} sx={{ marginBottom: "16px", padding: "16px" }}>
              <CardContent>
                <Typography variant="h6">Match {index + 1}</Typography>
                <Typography variant="body1">
                  Team 1: {matchup.team1.map(p => `${p.name} (ELO: ${p.elo_rating})`).join(" / ")}
                </Typography>
                <Typography variant="body1">
                  Team 2: {matchup.team2.map(p => `${p.name} (ELO: ${p.elo_rating})`).join(" / ")}
                </Typography>

                {/* Score Inputs */}
                <Box sx={{ marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    {["Set 1", "Set 2", "Set 3"].map((set, i) => (
                      <TextField
                        key={i}
                        label={`${set} Score (Team 1)`}
                        type="number"
                        value={matchup.team1Score[i] || ""}
                        onChange={(e) => handleScoreChange(index, "team1", i, e.target.value)}
                        sx={{ marginRight: "8px" }}
                      />
                    ))}
                  </Box>
                  <Box>
                    {["Set 1", "Set 2", "Set 3"].map((set, i) => (
                      <TextField
                        key={i}
                        label={`${set} Score (Team 2)`}
                        type="number"
                        value={matchup.team2Score[i] || ""}
                        onChange={(e) => handleScoreChange(index, "team2", i, e.target.value)}
                        sx={{ marginRight: "8px" }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Submit Match Result */}
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ marginTop: "16px" }}
                  onClick={() => handleSubmitMatchResult(index)}
                >
                  Submit Result
                </Button>

                {/* Reset Individual Matchup */}
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ marginLeft: "16px", marginTop: "16px" }}
                  onClick={() => resetSingleMatchup(index)}
                >
                  Remove Matchup
                </Button>

                {/* Display Winner */}
                {matchup.winner && (
                  <Typography variant="h6" color="primary" sx={{ marginTop: "16px" }}>
                    Winner: {matchup.winner === "team1" ? "Team 1" : "Team 2"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ManualMatchup;
