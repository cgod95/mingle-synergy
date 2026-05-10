import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function SafeImg({ fallbackSrc = "/avatar-fallback.png", onError, ...rest }: Props) {
  const [broken, setBroken] = React.useState(false);
  return (
    <img
      alt=""
      {...rest}
      src={broken ? fallbackSrc : (rest.src as string)}
      onError={(e) => { setBroken(true); onError?.(e); }}
    />
  );
}
