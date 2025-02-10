import React, { useState } from "react";
import axios from "axios";
import ManualMatchup from "./ManualMatchup";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider
  
} from "@mui/material";
import { Link } from "react-router-dom";

const K = 30; // The constant that determines how much the ELO changes after each match.

const calculateExpectedScore = (playerRating, opponentRating) => {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
};


// Function to assign baseline ELO (1200) if not already set
const getPlayerELO = (player) => {
  return player.elo_rating || 1200; // Use player's ELO rating, default to 1200
};

const recordMatchResult = async(matchData) => {
  // Make a POST request to the server to record the match result
  try {
    await axios.post("http://127.0.0.1:5000/api/matches", matchData);
    console.log("Match recorded successfully.");
  } catch (error) {
    console.error("Error recording match result:", error);
  }
}

const MatchdayDashboard = ({ selectedPlayers }) => {
  const [matchups, setMatchups] = useState([]);
  const [playersWithoutMatchups, setPlayersWithoutMatchups] = useState([]);
  const [players, setPlayers] = useState(selectedPlayers);
  const [matchupMode, setMatchupMode] = useState("auto");
  const [settings, setSettings] = useState({
  generateMatchupsEnabled: true,
  allowRegenMatchups: true,
});

  const generateMatchups = () => {
    // Reset the matchups and players without matchups before generating new ones
    setMatchups([]);
    setPlayersWithoutMatchups([]);

    // Sort players based on their ELO ratings in ascending order
    const sortedPlayers = [...selectedPlayers].sort((a, b) => getPlayerELO(a) - getPlayerELO(b));

    // Ensure there are enough players for pairing
    if (sortedPlayers.length < 4) {
      console.error("Not enough players to generate matchups.");
      return;
    }

    const newMatchups = [];
    let usedPlayers = new Set(); // Track players who are assigned to teams

    // Shuffle players to introduce randomness
    const shuffledPlayers = sortedPlayers.sort(() => Math.random() - 0.5);

    // Pair players for balanced teams based on average ELO with some flexibility
    for (let i = 0; i < Math.floor(shuffledPlayers.length / 4); i++) {
      // Create two-player teams
      const team1 = [shuffledPlayers[i * 4], shuffledPlayers[i * 4 + 1]];
      const team2 = [shuffledPlayers[i * 4 + 2], shuffledPlayers[i * 4 + 3]];

      // Ensure players are valid before pairing
      if (team1[0] && team1[1] && team2[0] && team2[1]) {
        // Calculate average ELO for each team
        const team1ELO = (getPlayerELO(team1[0]) + getPlayerELO(team1[1])) / 2;
        const team2ELO = (getPlayerELO(team2[0]) + getPlayerELO(team2[1])) / 2;

        // Introduce a small variation in ELO (flexibility in balancing)
        const ELODifference = Math.abs(team1ELO - team2ELO);
        if (ELODifference > 200) {
          // If there's a large difference, swap players from different teams to balance
          if (team1ELO > team2ELO) {
            const temp = team1[1];
            team1[1] = team2[0];
            team2[0] = temp;
          } else {
            const temp = team1[0];
            team1[0] = team2[1];
            team2[1] = temp;
          }
        }

        // Recalculate ELO after swapping players
        const newTeam1ELO = (getPlayerELO(team1[0]) + getPlayerELO(team1[1])) / 2;
        const newTeam2ELO = (getPlayerELO(team2[0]) + getPlayerELO(team2[1])) / 2;

        // Add the matchup to the newMatchups array
        newMatchups.push({
          team1: team1.map(player => ({ name: player.name, elo: getPlayerELO(player) })),
          team2: team2.map(player => ({ name: player.name, elo: getPlayerELO(player) })),
          team1Score: ["", "", ""], // Initialize with empty scores for 3 sets
          team2Score: ["", "", ""], // Initialize with empty scores for 3 sets
          winner: "",
          team1ELO: newTeam1ELO,
          team2ELO: newTeam2ELO,
          averageELOTeam1: newTeam1ELO,
          averageELOTeam2: newTeam2ELO // Store the average ELO of the matchup
        });

        // Mark players as used
        team1.forEach(player => usedPlayers.add(player.id));
        team2.forEach(player => usedPlayers.add(player.id));

      } else {
        console.error("Invalid players found during matchup generation.");
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



  //finsih this below 

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

  const handleScoreChange = (index, team, set, value) => {
    const updatedMatchups = [...matchups];
    if (team === "team1") {
      updatedMatchups[index].team1Score[set] = value;
    } else {
      updatedMatchups[index].team2Score[set] = value;
    }
    setMatchups(updatedMatchups);
  };

  const handleMatchResult = async (index) => {
    const updatedMatchups = [...matchups];
    const matchup = updatedMatchups[index];

    // Calculate total scores
    const team1Score = matchup.team1Score.reduce((a, b) => parseInt(a || 0) + parseInt(b || 0), 0);
    const team2Score = matchup.team2Score.reduce((a, b) => parseInt(a || 0) + parseInt(b || 0), 0);

    // Determine winner
    const winner = team1Score > team2Score ? "team1" : "team2";
    const loser = winner === "team1" ? "team2" : "team1";
    const scoreDifference = Math.abs(team1Score - team2Score);

    // Store player updates with pre & post ELO
    const updatedPlayers = selectedPlayers.map((player) => {
      const isTeam1Player = matchup.team1.some(p => p.name === player.name);
      const isTeam2Player = matchup.team2.some(p => p.name === player.name);

      let playerResult = 0;
      if (isTeam1Player && winner === "team1") playerResult = 1;
      if (isTeam2Player && winner === "team2") playerResult = 1;

      const playerELO = getPlayerELO(player);
      const opponentELO = isTeam1Player ? matchup.team2ELO : matchup.team1ELO;
      const expectedScore = calculateExpectedScore(playerELO, opponentELO);
      
      let ratingChange = K * (playerResult - expectedScore);
      if (scoreDifference > 15) ratingChange *= 1.5;

      const updatedELO = playerELO + ratingChange;
      player.elo_rating = updatedELO;

      updatePlayerELOInDatabase(player.id, updatedELO);

      return { ...player, elo_rating: updatedELO, elo_before: playerELO };
    });

    // Find players' pre & post ELOs
    const getUpdatedELO = (name) => updatedPlayers.find(p => p.name === name).elo_rating;
    const getPreELO = (name) => updatedPlayers.find(p => p.name === name).elo_before;

    // Format match data according to your database schema
    const matchData = {
      team1_player1: matchup.team1[0].name,
      team1_player2: matchup.team1[1].name,
      team2_player1: matchup.team2[0].name,
      team2_player2: matchup.team2[1].name,
      match_date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
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
    setMatchups(updatedMatchups);
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


  const switchToManualMode = () => {
    setMatchupMode("manual");
    setMatchups([]);
    setPlayersWithoutMatchups([]);
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


      {/* Mode Selection */}
      <Box sx={{ marginBottom: "24px", marginTop: "24px"}}>
        <Typography variant="h6">Select Matchup Mode:</Typography>
        <Button
          variant={matchupMode === "auto" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setMatchupMode("auto")}
        >
          Auto Matchups
        </Button>
        <Button
          variant={matchupMode === "manual" ? "contained" : "outlined"}
          color="primary"
          onClick={switchToManualMode}
          sx={{ marginLeft: "16px" }}
        >
          Manual Matchups
        </Button>
      </Box>

      {/* Show Manual or Auto Matchup Mode */}
      {matchupMode === "manual" ? <ManualMatchup selectedPlayers={selectedPlayers} /> : <Typography>Auto Matchups (Coming Soon)</Typography>}

      {/* Generate Matchups Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={generateMatchups}
        disabled={selectedPlayers.length < 4}
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
                    Team 1: {matchup.team1.map(player => `${player.name} (ELO: ${player.elo})`).join(" / ")}
                    <br />
                    Team 2: {matchup.team2.map(player => `${player.name} (ELO: ${player.elo})`).join(" / ")}
                  </Typography>

                  <Typography variant="body2" sx={{ marginTop: "8px", fontWeight: 'bold' }}>
                    Team 1 Avg ELO: {matchup.averageELOTeam1.toFixed(2)}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Team 2 Avg ELO: {matchup.averageELOTeam2.toFixed(2)}
                    </Typography>

                  {/* Input Scores */}
                  <Box sx={{ marginTop: "16px", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <Box>
                      <TextField
                        label="Set 1 Score (Team 1)"
                        type="number"
                        value={matchup.team1Score[0] || ""}
                        onChange={(e) => handleScoreChange(index, "team1", 0, e.target.value)}
                        sx={{ marginRight: "16px" }}
                      />
                      <TextField
                        label="Set 2 Score (Team 1)"
                        type="number"
                        value={matchup.team1Score[1] || ""}
                        onChange={(e) => handleScoreChange(index, "team1", 1, e.target.value)}
                        sx={{ marginRight: "16px" }}
                      />
                      <TextField
                        label="Set 3 Score (Team 1)"
                        type="number"
                        value={matchup.team1Score[2] || ""}
                        onChange={(e) => handleScoreChange(index, "team1", 2, e.target.value)}
                        sx={{ marginRight: "16px" }}
                      />
                    </Box>
                    <Box>
                      <TextField
                        label="Set 1 Score (Team 2)"
                        type="number"
                        value={matchup.team2Score[0] || ""}
                        onChange={(e) => handleScoreChange(index, "team2", 0, e.target.value)}
                        sx={{ marginRight: "16px" }}
                      />
                      <TextField
                        label="Set 2 Score (Team 2)"
                        type="number"
                        value={matchup.team2Score[1] || ""}
                        onChange={(e) => handleScoreChange(index, "team2", 1, e.target.value)}
                        sx={{ marginRight: "16px" }}
                      />
                      <TextField
                        label="Set 3 Score (Team 2)"
                        type="number"
                        value={matchup.team2Score[2] || ""}
                        onChange={(e) => handleScoreChange(index, "team2", 2, e.target.value)}
                        sx={{ marginRight: "16px" }}
                      />
                    </Box>
                  </Box>

                  {/* Handle Match Result */}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleMatchResult(index)}
                  >
                    Submit Result
                  </Button>
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