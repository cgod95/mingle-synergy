import React from "react";

type MatchStatus = "matched" | "expired" | "reconnected";

interface Props {
  status: MatchStatus;
}

const statusStyles: Record<MatchStatus, string> = {
  matched: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  reconnected: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<MatchStatus, string> = {
  matched: "Matched",
  expired: "Expired",
  reconnected: "Reconnected",
};

const MatchStatusBadge: React.FC<Props> = ({ status }) => {
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

export default MatchStatusBadge; 