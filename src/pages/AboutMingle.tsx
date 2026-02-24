import { QrCode, Heart, Users, ShieldCheck } from "lucide-react";
import MingleMLogo from "@/components/ui/MingleMLogo";

const steps = [
  {
    step: "01",
    title: "Check in",
    description:
      "Walk into a venue. Scan the QR code or tap to check in. We confirm you're actually there.",
    icon: <QrCode className="h-10 w-10 text-violet-400" />,
  },
  {
    step: "02",
    title: "Match",
    description:
      "See who else is here. Like someone? If they like you back, you're matched.",
    icon: <Heart className="h-10 w-10 text-violet-400" />,
  },
  {
    step: "03",
    title: "Meet",
    description:
      "You're in the same place. Skip the small talk over text. Go meet them.",
    icon: <Users className="h-10 w-10 text-violet-400" />,
  },
  {
    step: "04",
    title: "The rules",
    description:
      "Matches expire in 24 hours. You get 10 messages each. No algorithm — you see everyone at the venue.",
    icon: <ShieldCheck className="h-10 w-10 text-violet-400" />,
  },
];

export default function AboutMingle() {
  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="text-center mb-8 pt-4">
        <div className="flex justify-center mb-4">
          <MingleMLogo size="lg" showText={true} />
        </div>
        <p className="text-neutral-400 text-base">
          No more swiping. No more noise. Just meet people.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <div
            key={s.step}
            className="flex items-start gap-4 bg-neutral-800/60 rounded-xl p-4"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-violet-400">
                  {s.step}
                </span>
                <h3 className="text-base font-semibold text-white">
                  {s.title}
                </h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          Mingle brings dating back to the real world.
        </p>
      </div>
    </div>
  );
}
