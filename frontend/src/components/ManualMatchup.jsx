import React, { useState } from "react";
import { Button, Typography, Box, Card, CardContent, TextField } from "@mui/material";

const getPlayerELO = (player) => player.elo_rating || 1200;

const ManualMatchup = ({ selectedPlayers }) => {
  const [manualMatchups, setManualMatchups] = useState([]);
  const [selectedManualPlayers, setSelectedManualPlayers] = useState([]);
  const [usedPlayers, setUsedPlayers] = useState(new Set()); // Track players used in matchups

  const createManualMatchup = () => {
    if (selectedManualPlayers.length !== 4) return;

    const team1 = [selectedManualPlayers[0], selectedManualPlayers[1]];
    const team2 = [selectedManualPlayers[2], selectedManualPlayers[3]];

    setManualMatchups([
      ...manualMatchups,
      {
        team1: team1.map(p => ({ name: p.name, id: p.id, elo: getPlayerELO(p) })),
        team2: team2.map(p => ({ name: p.name, id: p.id, elo: getPlayerELO(p) })),
        team1Score: ["", "", ""],
        team2Score: ["", "", ""],
        winner: ""
      }
    ]);

    // Mark players as "used" so they cannot be selected again
    setUsedPlayers(new Set([...usedPlayers, ...selectedManualPlayers.map(p => p.id)]));

    // Reset selected players for the next matchup
    setSelectedManualPlayers([]);
  };

  const handleScoreChange = (index, team, setIndex, value) => {
    const updatedMatchups = [...manualMatchups];
    updatedMatchups[index][`${team}Score`][setIndex] = value;
    setManualMatchups(updatedMatchups);
  };

  const handleSubmitMatchResult = (index) => {
    const updatedMatchups = [...manualMatchups];
    const matchup = updatedMatchups[index];

    const team1TotalScore = matchup.team1Score.reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    const team2TotalScore = matchup.team2Score.reduce((acc, val) => acc + (parseInt(val) || 0), 0);

    matchup.winner = team1TotalScore > team2TotalScore ? "team1" : "team2";

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
                  Team 1: {matchup.team1.map(p => `${p.name} (ELO: ${p.elo})`).join(" / ")}
                </Typography>
                <Typography variant="body1">
                  Team 2: {matchup.team2.map(p => `${p.name} (ELO: ${p.elo})`).join(" / ")}
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
