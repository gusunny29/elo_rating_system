-- Create the players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    elo_rating INT NOT NULL,
    is_playing BOOLEAN DEFAULT FALSE
);
-- Insert sample player data
INSERT INTO players (name, elo_rating, is_playing)
VALUES ('Sunny Gu', 2500, false),
    ('Sam Diani', 2450, false),
    ('Andrew Nee', 2400, false),
    ('Hannah Radell', 2425, false),
    ('Sadie Beres', 2380, false),
    ('Tyler King', 2435, false),
    ('Aidan Sprouls', 2410, false),
    ('Matt Wallach', 2375, false),
    ('Ja Morant', 2350, false),
    ('Anthony Edwards', 2300, false);
-- Create the matches table
CREATE TABLE matchups (
    matchup_id SERIAL PRIMARY KEY,
    -- Unique ID for each matchup
    team1_player1 VARCHAR(50) NOT NULL,
    -- First player in Team 1
    team1_player2 VARCHAR(50) NOT NULL,
    -- Second player in Team 1
    team2_player1 VARCHAR(50) NOT NULL,
    -- First player in Team 2
    team2_player2 VARCHAR(50) NOT NULL,
    -- Second player in Team 2
    match_date DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Match date
    team1_score INT DEFAULT NULL,
    -- Score of Team 1 (NULL until updated)
    team2_score INT DEFAULT NULL,
    -- Score of Team 2 (NULL until updated)
    winner VARCHAR(50) DEFAULT NULL,
    -- Winning team (NULL until match is completed)
    UNIQUE (
        team1_player1,
        team1_player2,
        team2_player1,
        team2_player2,
        match_date
    ) -- Ensure unique matchups per day
);