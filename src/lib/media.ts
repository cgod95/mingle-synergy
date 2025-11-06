const u = encodeURIComponent;

export function venueImage(name: string, image?: string) {
  if (image && image.startsWith("http")) return image;
  // seeded Unsplash fallback (deterministic per name)
  return `https://source.unsplash.com/800x600/?${u(name)},venue`;
}

export function personAvatar(name: string, avatar?: string) {
  if (avatar && avatar.startsWith("http")) return avatar;
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${u(name)}`;
}
