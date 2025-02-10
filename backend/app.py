from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React


# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        dbname="sunnygu",
        user="sunnygu",
        password="Lke385gu!",
        host="localhost",
        port="5433",
    )
    return conn


# Elo Rating calculation function
def calculate_elo(player1_elo, player2_elo, player1_wins):
    K = 32
    expected_player1 = 1 / (1 + 10 ** ((player2_elo - player1_elo) / 400))
    expected_player2 = 1 / (1 + 10 ** ((player1_elo - player2_elo) / 400))
    if player1_wins:
        return player1_elo + K * (1 - expected_player1), player2_elo + K * (
            0 - expected_player2
        )
    else:
        return player1_elo + K * (0 - expected_player1), player2_elo + K * (
            1 - expected_player2
        )


# ✅ API to get player rankings
@app.route("/api/players", methods=["GET"])
def get_players():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, elo_rating FROM players ORDER BY elo_rating DESC;"
        )
        players = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(players)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ API to add a player
@app.route("/api/players", methods=["POST"])
def add_player():
    try:
        name = request.json["name"]
        elo_rating = request.json["elo_rating"]

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO players (name, elo_rating) VALUES (%s, %s) RETURNING id;",
            (name, elo_rating),
        )
        new_player_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        return (
            jsonify({"id": new_player_id, "name": name, "elo_rating": elo_rating}),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/players/<int:player_id>", methods=["DELETE"])
def delete_player(player_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Delete the player from the database
        cur.execute("DELETE FROM players WHERE id = %s;", (player_id,))
        conn.commit()

        cur.close()
        conn.close()

        return (
            jsonify({"message": f"Player with ID {player_id} deleted successfully"}),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ API to update a player's Elo rating
@app.route("/api/updateElo", methods=["POST"])
def update_elo():
    try:
        player_id = request.json["playerId"]
        new_elo_rating = request.json["elo_rating"]

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE players SET elo_rating = %s WHERE id = %s;",
            (new_elo_rating, player_id),
        )
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"player_id": player_id, "new_elo_rating": new_elo_rating}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ API to record a match result
@app.route("/api/matches", methods=["POST"])
def input_matches():
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Extract match data
        match_date = datetime.strptime(data["match_date"], "%Y-%m-%d").date()

        # Insert match into matchups table
        cur.execute(
            """
            INSERT INTO matches (
                team1_player1, team1_player2, 
                team2_player1, team2_player2, 
                match_date, 
                team1_g1_score, team2_g1_score, 
                team1_g2_score, team2_g2_score, 
                team1_g3_score, team2_g3_score, 
                winner, 
                player_1_pre_elo, player_2_pre_elo,
                player_3_pre_elo, player_4_pre_elo,
                player_1_post_elo, player_2_post_elo,
                player_3_post_elo, player_4_post_elo
                
            ) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (team1_player1, team1_player2, team2_player1, team2_player2, match_date)
            DO UPDATE SET
                team1_g1_score = EXCLUDED.team1_g1_score,
                team2_g1_score = EXCLUDED.team2_g1_score,
                team1_g2_score = EXCLUDED.team1_g2_score,
                team2_g2_score = EXCLUDED.team2_g2_score,
                team1_g3_score = EXCLUDED.team1_g3_score,
                team2_g3_score = EXCLUDED.team2_g3_score,
                winner = EXCLUDED.winner,
                player_1_pre_elo = EXCLUDED.player_1_pre_elo,
                player_2_pre_elo = EXCLUDED.player_2_pre_elo,
                player_3_pre_elo = EXCLUDED.player_3_pre_elo,
                player_4_pre_elo = EXCLUDED.player_4_pre_elo,
                player_1_post_elo = EXCLUDED.player_1_post_elo,
                player_2_post_elo = EXCLUDED.player_2_post_elo,
                player_3_post_elo = EXCLUDED.player_3_post_elo,
                player_4_post_elo = EXCLUDED.player_4_post_elo
            RETURNING matchup_id;
            """,
            (
                data["team1_player1"],
                data["team1_player2"],
                data["team2_player1"],
                data["team2_player2"],
                match_date,
                data["team1_g1_score"],
                data["team2_g1_score"],
                data["team1_g2_score"],
                data["team2_g2_score"],
                data["team1_g3_score"],
                data["team2_g3_score"],
                data["winner"],
                data["player_1_pre_elo"],
                data["player_2_pre_elo"],
                data["player_3_pre_elo"],
                data["player_4_pre_elo"],
                data["player_1_post_elo"],
                data["player_2_post_elo"],
                data["player_3_post_elo"],
                data["player_4_post_elo"],
            ),
        )

        matchup_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return (
            jsonify(
                {"message": "Match recorded successfully", "matchup_id": matchup_id}
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ API to create a match & update player Elo
@app.route("/api/match", methods=["POST"])
def create_match():
    try:
        data = request.get_json()
        player1_id = data["player1_id"]
        player2_id = data["player2_id"]
        player1_score = data["player1_score"]
        player2_score = data["player2_score"]

        winner_id = player1_id if player1_score > player2_score else player2_id

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT elo_rating FROM players WHERE id = %s;", (player1_id,))
        player1_elo = cur.fetchone()[0]
        cur.execute("SELECT elo_rating FROM players WHERE id = %s;", (player2_id,))
        player2_elo = cur.fetchone()[0]

        player1_new_elo, player2_new_elo = calculate_elo(
            player1_elo, player2_elo, player1_score > player2_score
        )

        cur.execute(
            "UPDATE players SET elo_rating = %s WHERE id = %s;",
            (player1_new_elo, player1_id),
        )
        cur.execute(
            "UPDATE players SET elo_rating = %s WHERE id = %s;",
            (player2_new_elo, player2_id),
        )

        cur.execute(
            "INSERT INTO matches (player1_id, player2_id, player1_score, player2_score, winner_id) VALUES (%s, %s, %s, %s, %s);",
            (player1_id, player2_id, player1_score, player2_score, winner_id),
        )

        conn.commit()
        cur.close()
        conn.close()

        return (
            jsonify({"message": "Match result recorded", "winner_id": winner_id}),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
