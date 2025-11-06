export type DemoPerson = {
  id: string;
  name: string;
  photo: string;
  bio?: string;
};

type VenueRoster = Record<string, DemoPerson[]>;

export const demoPeopleByVenue: VenueRoster = {
  // Your current seeded venues
  "v1": [
    { id: "p1", name: "Maya", photo: "https://i.pravatar.cc/150?img=5", bio: "Into live music and mezcal." },
    { id: "p2", name: "Owen", photo: "https://i.pravatar.cc/150?img=11", bio: "Tech + tennis + tacos." },
    { id: "p3", name: "Lana", photo: "https://i.pravatar.cc/150?img=32", bio: "Art grad. Loves gallery nights." }
  ],
  "v2": [
    { id: "p4", name: "Kai", photo: "https://i.pravatar.cc/150?img=14", bio: "Coffee snob. Amateur DJ." },
    { id: "p5", name: "Rae", photo: "https://i.pravatar.cc/150?img=20", bio: "Pilates + picnics + puppies." },
    { id: "p6", name: "Jay", photo: "https://i.pravatar.cc/150?img=28", bio: "Comedy nights every week." }
  ],
  "v3": [
    { id: "p7", name: "Nina", photo: "https://i.pravatar.cc/150?img=36", bio: "Salsa beginner. Be nice :)" },
    { id: "p8", name: "Theo", photo: "https://i.pravatar.cc/150?img=41", bio: "Bouldering + board games." },
    { id: "p9", name: "Iris", photo: "https://i.pravatar.cc/150?img=49", bio: "Photographer. Street & film." }
  ],

  // Also keep earlier sample IDs
  "bar-101": [
    { id: "p1", name: "Maya", photo: "https://i.pravatar.cc/150?img=5", bio: "Into live music and mezcal." },
    { id: "p2", name: "Owen", photo: "https://i.pravatar.cc/150?img=11", bio: "Tech + tennis + tacos." },
    { id: "p3", name: "Lana", photo: "https://i.pravatar.cc/150?img=32", bio: "Art grad. Loves gallery nights." }
  ],
  "bar-102": [
    { id: "p4", name: "Kai", photo: "https://i.pravatar.cc/150?img=14", bio: "Coffee snob. Amateur DJ." },
    { id: "p5", name: "Rae", photo: "https://i.pravatar.cc/150?img=20", bio: "Pilates + picnics + puppies." },
    { id: "p6", name: "Jay", photo: "https://i.pravatar.cc/150?img=28", bio: "Comedy nights every week." }
  ],
  "bar-103": [
    { id: "p7", name: "Nina", photo: "https://i.pravatar.cc/150?img=36", bio: "Salsa beginner. Be nice :)" },
    { id: "p8", name: "Theo", photo: "https://i.pravatar.cc/150?img=41", bio: "Bouldering + board games." },
    { id: "p9", name: "Iris", photo: "https://i.pravatar.cc/150?img=49", bio: "Photographer. Street & film." }
  ]
};
