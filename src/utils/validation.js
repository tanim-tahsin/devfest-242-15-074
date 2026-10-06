export function getRequirementStatus(
  requirement,
  matchedFile,
  expiryDate,
  submissionDeadline,
) {
  if (!matchedFile) {
    if (requirement.mandatory) {
      return "missing";
    }

    return "notProvided";
  }

  if (requirement.has_expiry === true) {
    if (!expiryDate) {
      return "expiryNeeded";
    }

    if (submissionDeadline) {
      const expiry = new Date(expiryDate);
      const deadline = new Date(submissionDeadline);

      expiry.setHours(23, 59, 59, 999);
      deadline.setHours(23, 59, 59, 999);

      if (expiry < deadline) {
        return "expired";
      }
    }
  }

  return "ok";
}

export function hasBlockingStatus(status) {
  return (
    status === "missing" || status === "expiryNeeded" || status === "expired"
  );
}

export async function getFileHash(file) {
  const arrayBuffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
