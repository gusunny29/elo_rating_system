-- Create the players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    elo_rating INT NOT NULL,
    is_playing BOOLEAN DEFAULT FALSE,
    wins INT NOT NULL,
    losses INT NOT NULL
);
-- Insert sample player data
INSERT INTO players (name, elo_rating, is_playing, wins, losses)
VALUES ('Sunny Gu', 2500, false, 0, 0),
    ('Sam Diani', 2450, false, 0, 0),
    ('Andrew Nee', 2400, false, 0, 0),
    ('Hannah Radell', 2425, false, 0, 0),
    ('Sadie Beres', 2380, false, 0, 0),
    ('Tyler King', 2435, false, 0, 0),
    ('Aidan Sprouls', 2410, false, 0, 0),
    ('Matt Wallach', 2375, false, 0, 0),
    ('Ja Morant', 2350, false, 0, 0),
    ('Anthony Edwards', 2300, false, 0, 0);
-- Create the matches table
CREATE TABLE IF NOT EXISTS matches (
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
    team1_g1_score INT DEFAULT NULL,
    -- Score of Team 1 (NULL until updated)
    team2_g1_score INT DEFAULT NULL,
    -- Score of Team 2 (NULL until updated)
    team1_g2_score INT DEFAULT NULL,
    -- Score of Team 1 (NULL until updated)
    team2_g2_score INT DEFAULT NULL,
    -- Score of Team 2 (NULL until updated)
    team1_g3_score INT DEFAULT NULL,
    -- Score of Team 1 (NULL until updated)
    team2_g3_score INT DEFAULT NULL,
    -- Score of Team 2 (NULL until updated)
    winner VARCHAR(50) DEFAULT NULL,
    -- Winning team (NULL until match is completed)
    player_1_pre_elo FLOAT DEFAULT NULL,
    -- Pre-Elo rating of Player 1 (NULL until updated)
    player_2_pre_elo FLOAT DEFAULT NULL,
    -- Pre-Elo rating of Player 2 (NULL until updated)
    player_3_pre_elo FLOAT DEFAULT NULL,
    -- Pre-Elo rating of Player 3 (NULL until updated)
    player_4_pre_elo FLOAT DEFAULT NULL,
    -- Pre-Elo rating of Player 4 (NULL until updated)
    player_1_post_elo FLOAT DEFAULT NULL,
    -- Post-Elo rating of Player 1 (NULL until updated)
    player_2_post_elo FLOAT DEFAULT NULL,
    -- Post-Elo rating of Player 2 (NULL until updated)
    player_3_post_elo FLOAT DEFAULT NULL,
    -- Post-Elo rating of Player 3 (NULL until updated)
    player_4_post_elo FLOAT DEFAULT NULL,
    -- Post-Elo rating of Player 4 (NULL until updated)
    UNIQUE (
        team1_player1,
        team1_player2,
        team2_player1,
        team2_player2,
        match_date
    ) -- Ensure unique matchups per day
);