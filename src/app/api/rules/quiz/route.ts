import { NextResponse } from "next/server";

export async function GET() {
  const quiz = [
    {
      id: 1,
      question: "If the black 8-ball is potted on a legal break in Blackball SA, what happens?",
      options: [
        "The breaker instantly wins the game",
        "The breaker can choose to re-spot the 8-ball or re-rack all balls and break again",
        "The breaker immediately loses the frame",
        "The opponent receives ball in hand from baulk",
      ],
      correctIndex: 1,
      explanation:
        "Under official Blackball South Africa (BSA) and WPA rules, potting the black on the break is NOT an instant win. The breaker may either re-spot the black and continue, or demand a re-rack.",
    },
    {
      id: 2,
      question: "How are ball groups (Reds vs Yellows) determined in Blackball 8-ball pool?",
      options: [
        "By whichever color is pocketed on the break",
        "The table remains open after the break until a player legally pots a ball in regular play",
        "The player who won the lag declares their group before the break",
        "Whichever player pots two balls first",
      ],
      correctIndex: 1,
      explanation:
        "The table remains OPEN after the break, regardless of balls potted on the break. Groups are decided only when a player legally pots a ball of a specific group in subsequent play.",
    },
    {
      id: 3,
      question: "What is the penalty award when an opponent commits a standard foul (e.g. cue-ball scratch)?",
      options: [
        "Two cumulative shots that carry over even if missed",
        "One Free Shot followed by the remainder of the regular visit",
        "Opponent loses the frame immediately",
        "Ball in hand anywhere on the table with no free shot",
      ],
      correctIndex: 1,
      explanation:
        "The trademark Blackball rule is ONE FREE SHOT followed by normal play. Street conventions claiming 'two shots carry' are invalid under official Blackball rules.",
    },
    {
      id: 4,
      question: "On a Free Shot in Blackball SA, may you legally strike and pot your opponent's ball?",
      options: [
        "No, hitting an opponent's ball is a standard foul",
        "Yes, any ball may be legally targeted or pocketed on a free shot",
        "Only if your own balls are tied up or snookered",
        "Only if you call the pocket beforehand",
      ],
      correctIndex: 1,
      explanation:
        "On a Free Shot, the incoming player may legally strike and pot ANY ball on the table, including the opponent's ball, without committing a foul.",
    },
    {
      id: 5,
      question: "You pocket the black 8-ball to win the match, but the white cue ball scratches into a pocket on the same shot. What is the ruling?",
      options: [
        "You win the frame because the 8-ball entered the pocket first",
        "The 8-ball is respotted on the black spot and play continues",
        "Loss of Frame: Opponent is immediately awarded the win for that frame",
        "The frame is a stalemate and must be re-racked",
      ],
      correctIndex: 2,
      explanation:
        "Potting the 8-ball and committing any foul on the same shot (such as cue-ball scratch) constitutes an immediate Loss of Frame under Blackball SA rules.",
    },
  ];

  return NextResponse.json({ quiz });
}
