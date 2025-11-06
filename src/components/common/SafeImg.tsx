import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function SafeImg({ fallbackSrc = "/avatar-fallback.png", onError, ...rest }: Props) {
  const [broken, setBroken] = React.useState(false);
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      {...rest}
      src={broken ? fallbackSrc : (rest.src as string)}
      onError={(e) => { setBroken(true); onError?.(e); }}
    />
  );
}
