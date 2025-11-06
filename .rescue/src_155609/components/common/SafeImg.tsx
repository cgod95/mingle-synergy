import { useState, ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function SafeImg({ fallbackSrc = "/avatar-fallback.png", onError, ...rest }: Props) {
  const [broken, setBroken] = useState(false);
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      {...rest}
      src={broken ? fallbackSrc : rest.src}
      onError={(e) => {
        setBroken(true);
        onError?.(e);
      }}
    />
  );
}
