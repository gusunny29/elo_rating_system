import React, { useState } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  FormControlLabel,
  Checkbox,
  Divider,
  Card,
  CardContent,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";

const MatchdayDashboard = ({ selectedPlayers }) => {
  const [matchups, setMatchups] = useState([]);
  const [playersWithoutMatchups, setPlayersWithoutMatchups] = useState([]);
  const [settings, setSettings] = useState({
    generateMatchupsEnabled: true,
    allowRegenMatchups: true,
  });

  const generateMatchups = () => {
    // Shuffle players randomly
    const shuffledPlayers = [...selectedPlayers].sort(() => Math.random() - 0.5);

    const newMatchups = [];
    let usedPlayers = new Set(); // Track players who are assigned to teams

    // Pair players into 2v2 matchups
    for (let i = 0; i < shuffledPlayers.length; i += 4) {
      const team1 = shuffledPlayers[i];
      const team2 = shuffledPlayers[i + 1];
      const team3 = shuffledPlayers[i + 2];
      const team4 = shuffledPlayers[i + 3];
      if (team1 && team2 && team3 && team4) {
        newMatchups.push({
          team1: [team1.name, team2.name],
          team2: [team3.name, team4.name],
          team1Score: "",
          team2Score: "",
          winner: "",
        });

        usedPlayers.add(team1.id);
        usedPlayers.add(team2.id);
        usedPlayers.add(team3.id);
        usedPlayers.add(team4.id);
      }
    }

    // Find players who aren't in any matchups
    const playersNotInMatchups = selectedPlayers.filter(
      (player) => !usedPlayers.has(player.id)
    );

    // Update the state with matchups and players without matchups
    setMatchups(newMatchups);
    setPlayersWithoutMatchups(playersNotInMatchups);
  };

  const handleSettingChange = (event) => {
    const { name, checked } = event.target;
    setSettings((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const renderSelectedPlayers = () => (
    <div>
        <Typography variant="h6" gutterBottom>
            Selected Players for Matchday:
        </Typography>
        {selectedPlayers.length === 0 ? (
            <Typography variant="body1">No players selected for matchday.</Typography>
        ) : (
            <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
            }}
            >
            {selectedPlayers.map((player) => (
                <Box
                key={player.id}
                sx={{
                    flex: "0 0 calc(25% - 16px)", // 25% width for each player item to create 4 columns
                    boxSizing: "border-box",
                }}
                >
                <Typography variant="body1"> - {player.name}</Typography>
                </Box>
            ))}
            </Box>
        )}
    </div>

  );

  const handleScoreChange = (index, team, value) => {
    const updatedMatchups = [...matchups];
    if (team === "team1") {
      updatedMatchups[index].team1Score = value;
    } else {
      updatedMatchups[index].team2Score = value;
    }
    setMatchups(updatedMatchups);
  };

  const handleWinnerChange = (index, winner) => {
    const updatedMatchups = [...matchups];
    updatedMatchups[index].winner = winner;
    setMatchups(updatedMatchups);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Matchday Dashboard
      </Typography>

      {/* Settings Panel */}
      <Box sx={{ border: "1px solid #ccc", padding: "16px", marginBottom: "24px" }}>
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.generateMatchupsEnabled}
              onChange={handleSettingChange}
              name="generateMatchupsEnabled"
              color="primary"
            />
          }
          label="Enable Matchup Generation"
        />
        <Divider sx={{ margin: "16px 0" }} />
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.allowRegenMatchups}
              onChange={handleSettingChange}
              name="allowRegenMatchups"
              color="primary"
            />
          }
          label="Allow Re-generation of Matchups"
        />
      </Box>

      {renderSelectedPlayers()}

      {/* Generate Matchups Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={generateMatchups}
        disabled={!settings.generateMatchupsEnabled || selectedPlayers.length < 4}
      >
        Generate 2v2 Matchups
      </Button>

      {/* Display Matchups as Cards */}
      {matchups.length > 0 && (
        <Box sx={{ marginTop: "24px" }}>
          <Typography variant="h6" gutterBottom>
            Matchups:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {matchups.map((matchup, index) => (
              <Card key={index} sx={{ marginBottom: "16px", width: "calc(50% - 16px)" }}>
                <CardContent>
                  <Typography variant="h6">Match {index + 1}</Typography>
                  <Typography variant="body1">
                    Team 1: {matchup.team1.join("/")} <br />
                    Team 2: {matchup.team2.join("/")}
                  </Typography>

                  {/* Input Scores */}
                  <Box sx={{ marginTop: "16px" }}>
                    <TextField
                      label="Team 1 Score"
                      type="number"
                      value={matchup.team1Score}
                      onChange={(e) => handleScoreChange(index, "team1", e.target.value)}
                      sx={{ marginRight: "16px" }}
                      fullWidth
                    />
                    <TextField
                      label="Team 2 Score"
                      type="number"
                      value={matchup.team2Score}
                      onChange={(e) => handleScoreChange(index, "team2", e.target.value)}
                      fullWidth
                    />
                  </Box>

                  {/* Winner Selection */}
                  <FormControl component="fieldset" sx={{ marginTop: "16px" }}>
                    <FormLabel component="legend">Select Winner</FormLabel>
                    <RadioGroup
                      row
                      value={matchup.winner}
                      onChange={(e) => handleWinnerChange(index, e.target.value)}
                    >
                      <FormControlLabel
                        value="team1"
                        control={<Radio />}
                        label={matchup.team1.join("/")}
                      />
                      <FormControlLabel
                        value="team2"
                        control={<Radio />}
                        label={matchup.team2.join("/")}
                      />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Players Without Matchups */}
      {playersWithoutMatchups.length > 0 && (
        <Box sx={{ marginTop: "24px" }}>
          <Typography variant="h6" gutterBottom>
            Players without Matchups:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {playersWithoutMatchups.map((player) => (
              <Card key={player.id} sx={{ marginBottom: "16px", width: "calc(50% - 16px)" }}>
                <CardContent>
                  <Typography variant="body1">{player.name}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Back Button */}
      <Link to="/player-management">
        <Button variant="outlined" style={{ marginTop: "20px" }}>
          Back to Player Management
        </Button>
      </Link>
    </Container>
  );
};

export default MatchdayDashboard;
