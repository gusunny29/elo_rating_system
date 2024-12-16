from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import sql

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


# API to get player rankings
@app.route("/api/players", methods=["GET"])
def get_players():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM players ORDER BY elo_rating DESC;")
    players = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(players)


# API to add a player
@app.route("/api/players", methods=["POST"])
def add_player():
    name = request.json["name"]
    elo_rating = request.json["elo_rating"]

    # Connect to the database
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO players (name, elo_rating) VALUES (%s, %s) RETURNING player_id;",
        (name, elo_rating),
    )
    new_player_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return (
        jsonify({"player_id": new_player_id, "name": name, "elo_rating": elo_rating}),
        201,
    )


# API to create a match
@app.route("/api/match", methods=["POST"])
def create_match():
    player1_id = request.json["player1_id"]
    player2_id = request.json["player2_id"]
    player1_score = request.json["player1_score"]
    player2_score = request.json["player2_score"]

    # Determine winner
    winner_id = player1_id if player1_score > player2_score else player2_id

    # Get current Elo ratings
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT elo_rating FROM players WHERE player_id = %s;", (player1_id,))
    player1_elo = cur.fetchone()[0]
    cur.execute("SELECT elo_rating FROM players WHERE player_id = %s;", (player2_id,))
    player2_elo = cur.fetchone()[0]

    # Calculate new Elo ratings
    player1_new_elo, player2_new_elo = calculate_elo(
        player1_elo, player2_elo, player1_score > player2_score
    )

    # Update player Elo ratings
    cur.execute(
        "UPDATE players SET elo_rating = %s WHERE player_id = %s;",
        (player1_new_elo, player1_id),
    )
    cur.execute(
        "UPDATE players SET elo_rating = %s WHERE player_id = %s;",
        (player2_new_elo, player2_id),
    )

    # Insert match result into the database
    cur.execute(
        "INSERT INTO matches (player1_id, player2_id, player1_score, player2_score, winner_id) VALUES (%s, %s, %s, %s, %s);",
        (player1_id, player2_id, player1_score, player2_score, winner_id),
    )

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Match result recorded", "winner_id": winner_id}), 200


if __name__ == "__main__":
    app.run(debug=True)
