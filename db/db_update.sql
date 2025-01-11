-- Players Table
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    -- Unique ID for each player
    name VARCHAR(255) NOT NULL,
    -- Player's name
    elo_rating FLOAT DEFAULT 1500 -- Initial Elo rating (1500 is a common starting point)
);