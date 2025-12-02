export default function Avatar({ src, alt, size=40, className="" }: {src?: string; alt?: string; size?: number; className?: string}) {
  return <img src={src} alt={alt} width={size} height={size} className={`rounded-full border border-slate-200 object-cover ${className}`} />;
}
