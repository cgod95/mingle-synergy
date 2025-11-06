import React, { useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
};

const FALLBACK = "https://picsum.photos/seed/mingle-fallback/600/400";

export default function ImageWithFallback({ src, fallback = FALLBACK, alt = "", ...rest }: Props) {
  const [ok, setOk] = useState(true);
  return (
    <img
      src={ok && src ? src.toString() : fallback}
      alt={alt}
      onError={() => setOk(false)}
      {...rest}
    />
  );
}
