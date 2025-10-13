import React from "react";

const LikedUsers = () => {
  const mockLikedUsers = [
    {
      id: "1",
      name: "Alex",
      age: 26,
      photoUrl: "https://i.pravatar.cc/150?img=4",
      venue: "The Velvet Lounge",
      likedAt: "2 hours ago"
    },
    {
      id: "2",
      name: "Mia",
      age: 27,
      photoUrl: "https://i.pravatar.cc/150?img=5",
      venue: "Neon Terrace", 
      likedAt: "1 day ago"
    },
    {
      id: "3",
      name: "Sophie",
      age: 25,
      photoUrl: "https://i.pravatar.cc/150?img=6",
      venue: "Garden Underground",
      likedAt: "3 days ago"
    }
  ];

  return (
    <div className="p-4 pt-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-center">People You Liked</h1>
      <div className="space-y-4">
        {mockLikedUsers.map((user) => (
          <div
            key={user.id}
            className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <img
                src={user.photoUrl}
                alt={`${user.name}'s photo`}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.name}, {user.age}</h3>
                <p className="text-sm text-gray-600">{user.venue}</p>
                <p className="text-xs text-gray-500">Liked {user.likedAt}</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                  Unlike
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedUsers;