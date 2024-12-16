import pandas as pd


# Function to calculate new ELO based on team averages
def calculate_new_elo(winning_team_avg, losing_team_avg):
    k_factor = 32  # Adjust this K-factor as needed
    expected_winner = 1 / (1 + 10 ** ((losing_team_avg - winning_team_avg) / 400))
    new_winning_team_avg = winning_team_avg + k_factor * (1 - expected_winner)
    new_losing_team_avg = losing_team_avg - k_factor * (1 - expected_winner)

    return new_winning_team_avg, new_losing_team_avg


# Function to clamp ELO between 0.0 and 5.0
def clamp_elo(elo):
    return max(0.0, min(elo, 5.0))


# Function to update ELOs based on match results from a CSV file
def update_elos(csv_file, rankings_file):
    # Read the match results from the CSV file
    results_df = pd.read_csv(csv_file)

    # Read the current ELO data
    players_df = pd.read_csv(rankings_file)

    # Update ELOs based on results
    for index, row in results_df.iterrows():
        # Extract teams from the row
        team1_players = [player.strip() for player in row["Team 1"].split(",")]
        team2_players = [player.strip() for player in row["Team 2"].split(",")]
        winner_team = row["Winner"]

        # Calculate average ELO for both teams
        team1_elos = players_df[players_df["Name"].isin(team1_players)]["Elo"].values
        team2_elos = players_df[players_df["Name"].isin(team2_players)]["Elo"].values

        if len(team1_elos) == 0 or len(team2_elos) == 0:
            continue  # Skip if no valid players are found

        avg_team1_elo = team1_elos.mean()
        avg_team2_elo = team2_elos.mean()

        # Determine winning and losing teams based on the Winner column
        if winner_team == 1:
            winning_players = team1_players
            losing_players = team2_players
        elif winner_team == 2:
            winning_players = team2_players
            losing_players = team1_players
        else:
            continue  # Skip if Winner is not valid

        # Calculate new ELOs for both teams
        new_avg_winning_team, new_avg_losing_team = calculate_new_elo(
            avg_team1_elo if winner_team == 1 else avg_team2_elo,
            avg_team2_elo if winner_team == 1 else avg_team1_elo,
        )

        # Update ELOs for the winning team
        for player_name in winning_players:
            player_row = players_df[players_df["Name"] == player_name]
            if not player_row.empty:
                players_df.loc[players_df["Name"] == player_name, "Elo"] = clamp_elo(
                    new_avg_winning_team
                )

        # Update ELOs for the losing team
        for player_name in losing_players:
            player_row = players_df[players_df["Name"] == player_name]
            if not player_row.empty:
                players_df.loc[players_df["Name"] == player_name, "Elo"] = clamp_elo(
                    new_avg_losing_team
                )

    # Save the updated ELOs back to the CSV
    players_df.to_csv(rankings_file, index=False)
    print("ELOs updated successfully from the CSV sheet.")


# Example usage
matchups_file = "matchups.csv"  # Path to your match results CSV file
rankings_file = "rankings_updated.csv"  # Path to your rankings CSV file
update_elos(matchups_file, rankings_file)
