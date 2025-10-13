// 🧠 Purpose: Implement Matches page UI to display matched users from mock data.

import React from "react";

const Matches = () => {
  const mockMatches = [
    {
      id: "1",
      name: "Sarah",
      age: 25,
      photoUrl: "https://i.pravatar.cc/150?img=1",
      venue: "The Velvet Lounge",
      timeAgo: "2 hours ago"
    },
    {
      id: "2",
      name: "Emma",
      age: 28,
      photoUrl: "https://i.pravatar.cc/150?img=2", 
      venue: "Neon Terrace",
      timeAgo: "1 day ago"
    },
    {
      id: "3",
      name: "Jessica",
      age: 24,
      photoUrl: "https://i.pravatar.cc/150?img=3",
      venue: "Garden Underground", 
      timeAgo: "3 days ago"
    }
  ];

  return (
    <div className="p-4 pt-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Matches</h1>
      <div className="space-y-4">
        {mockMatches.map((match) => (
          <div
            key={match.id}
            className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <img
                src={match.photoUrl}
                alt={`${match.name}'s photo`}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{match.name}, {match.age}</h3>
                <p className="text-sm text-gray-600">{match.venue}</p>
                <p className="text-xs text-gray-500">{match.timeAgo}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;