import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Matchday = () => {
  const [matches, setMatches] = useState([]);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/rankings').then((response) => {
      setMatches(response.data); // For simplicity, pairing players by Elo
    });
  }, []);

  const handleRecordMatch = async (match) => {
    const winnerId = player1Score > player2Score ? match.player1_id : match.player2_id;
    await axios.post('http://localhost:5000/matches', {
      player1_id: match.player1_id,
      player2_id: match.player2_id,
      player1_score: player1Score,
      player2_score: player2Score,
      winner_id: winnerId,
    });
  };

  return (
    <div>
      <h2>Matchday</h2>
      {matches.map((match) => (
        <div key={match.id}>
          <div>{match.player1.name} vs {match.player2.name}</div>
          <input
            type="number"
            placeholder="Player 1 score"
            onChange={(e) => setPlayer1Score(e.target.value)}
          />
          <input
            type="number"
            placeholder="Player 2 score"
            onChange={(e) => setPlayer2Score(e.target.value)}
          />
          <button onClick={() => handleRecordMatch(match)}>Record Match</button>
        </div>
      ))}
    </div>
  );
};

export default Matchday;