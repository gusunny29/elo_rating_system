import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Players from "./components/Players.jsx";
import AddPlayer from "./components/AddPlayer.jsx";
// import AttendanceManagement from "./components/AttendanceManagement.jsx";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PlayerManagement from "./components/PlayerManagement.jsx";

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Router>
      <div>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Elo Rating System</Typography>
          </Toolbar>
        </AppBar>

        {/* Side Drawer */}
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
          <div style={{ width: 250 }}>
            <List>
              <ListItem
                button
                component="a"
                href="/frontend/elo-ranking-system/src/components/Players.jsx"
              >
                <ListItemText primary="Home" />
              </ListItem>
              <Divider />
              <ListItem button component={"PlayerManagement"} href="/PlayerManagement">
                <ListItemText primary="Player Management" />
              </ListItem>
              <ListItem button component={"Players"} href="/Players">
                <ListItemText primary="Leaderboard" />
              </ListItem>
            </List>
          </div>
        </Drawer>

        <Container>
          <Routes>
            <Route exact path="/" element={PlayerManagement} />
            {/* <Route path="/attendance" component={AttendanceManagement} /> */}
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;
