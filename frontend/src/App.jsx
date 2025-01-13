import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PlayerManagement from "./components/PlayerManagement.jsx";
import HomePage from "./components/HomePage.jsx"; // Import the HomePage component
import MatchdayDashboard from "./components/MatchupDashboard.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import { Container, Typography, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Import ThemeProvider and createTheme

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  // Create a theme with customization
  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2", // Customize primary color
      },
      secondary: {
        main: "#f5f5f5", // Customize secondary color
      },
      background: {
        default: "#1976d2", // Set background color
      },
      success: {
        main: "#4caf50", // Customize success color
        dark: "#baadb2"
      }
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div>
          <AppBar position="sticky">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6">ELO</Typography>
            </Toolbar>
          </AppBar>

          {/* Side Drawer */}
          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
            <div style={{ width: 250 }}>
              <List>
                <ListItem button component={Link} to="/" onClick={closeDrawer}>
                  <ListItemText primary="Home" />
                </ListItem>
                <Divider />
                <ListItem button component={Link} to="/player-management" onClick={closeDrawer}>
                  <ListItemText primary="Player Management" />
                </ListItem>
                <ListItem button component={Link} to="/leaderboard" onClick={closeDrawer}>
                  <ListItemText primary="Leaderboard" />
                </ListItem>
                <ListItem button component={Link} to="/matchday-dashboard" onClick={closeDrawer}>
                  <ListItemText primary="Matchday Dashboard" />
                </ListItem>
              
              </List>
            </div>
          </Drawer>

          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/player-management" element={<PlayerManagement setSelectedPlayers={setSelectedPlayers}/>} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route
                path="/matchday-dashboard"
                element={<MatchdayDashboard selectedPlayers={selectedPlayers} />}
              />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
