function StatusBadge({ status }) {
  const statusConfig = {
    missing: {
      label: "Missing",
      className: "status-missing",
    },
    expiryNeeded: {
      label: "Expiry date needed",
      className: "status-expiry",
    },
    expired: {
      label: "Expired",
      className: "status-expired",
    },
    notProvided: {
      label: "Not provided",
      className: "status-not-provided",
    },
    ok: {
      label: "OK",
      className: "status-ok",
    },
  };

  const current = statusConfig[status] || statusConfig.missing;

  return (
    <span className={`status-badge ${current.className}`}>{current.label}</span>
  );
}

export default StatusBadge;
