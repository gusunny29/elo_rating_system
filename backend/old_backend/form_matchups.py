import pandas as pd
import random

# Read player data from CSV
players_df = pd.read_csv("rankings.csv")


# Function to form matchups
def form_matchups(players_df):
    matchups = []
    used = set()  # To track which players have been matched

    # Sort players by Elo
    players_df = players_df.sort_values(by="Elo").reset_index(drop=True)

    # Create a list of available players for pairing
    available_players = players_df.to_dict(orient="records")

    for player in available_players:
        if player["Name"] in used:
            continue

        # Find a random teammate within 1.00 Elo
        potential_teammates = [
            p
            for p in available_players
            if p["Name"] != player["Name"]
            and abs(player["Elo"] - p["Elo"]) <= 1.00
            and p["Name"] not in used
        ]

        if not potential_teammates:
            continue

        teammate = random.choice(potential_teammates)
        matchups.append((player, teammate))
        used.add(player["Name"])
        used.add(teammate["Name"])

    # Now match the pairs against each other based on average Elo
    final_matchups = []
    for i in range(0, len(matchups), 2):
        if i + 1 < len(matchups):
            team1 = matchups[i]
            team2 = matchups[i + 1]

            team1_avg_elo = (team1[0]["Elo"] + team1[1]["Elo"]) / 2
            team2_avg_elo = (team2[0]["Elo"] + team2[1]["Elo"]) / 2

            if abs(team1_avg_elo - team2_avg_elo) <= 1.00:
                final_matchups.append((team1, team2))

    return final_matchups


# Save matchups to a CSV file
def save_matchups_to_csv(matchups, filename="matchups.csv"):
    rows = []

    for idx, (team1, team2) in enumerate(matchups):
        row = {
            "Team 1": f"{team1[0]['Name']}, {team1[1]['Name']}",
            "Team 2": f"{team2[0]['Name']}, {team2[1]['Name']}",
            "Winner": "",  # To be filled later
        }
        rows.append(row)

    # Create a DataFrame and save it to a CSV
    matchups_df = pd.DataFrame(rows)
    matchups_df.to_csv(filename, index=False)


# Form matchups and save them
matchups = form_matchups(players_df)

if matchups:
    save_matchups_to_csv(matchups)
    print("Matchups saved to matchups.csv.")
else:
    print("No suitable matchups found.")
