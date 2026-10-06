function MatchPanel({
  requirements,
  files,
  matches,
  setMatches,
  expiryDates,
  setExpiryDates,
  language = "en",
}) {
  const getRequirementTitle = (requirement) => {
    if (language === "bn") {
      return (
        requirement.title_bn ||
        requirement.name_bn ||
        requirement.title ||
        requirement.name ||
        requirement.id
      );
    }

    return (
      requirement.title_en ||
      requirement.name_en ||
      requirement.title ||
      requirement.name ||
      requirement.id
    );
  };

  const getFileForRequirement = (requirementId) => {
    const fileId = matches[requirementId];

    if (!fileId) {
      return null;
    }

    return files.find((file) => file.id === fileId) || null;
  };

  const getMatchedRequirementId = (fileId) => {
    return Object.keys(matches).find(
      (requirementId) => matches[requirementId] === fileId,
    );
  };

  const handleMatch = (requirementId, fileId) => {
    setMatches((previousMatches) => {
      const updatedMatches = { ...previousMatches };

      delete updatedMatches[requirementId];

      if (!fileId) {
        return updatedMatches;
      }

      Object.keys(updatedMatches).forEach((id) => {
        if (updatedMatches[id] === fileId) {
          delete updatedMatches[id];
        }
      });

      updatedMatches[requirementId] = fileId;

      return updatedMatches;
    });

    if (!fileId) {
      setExpiryDates((previousDates) => {
        const updatedDates = { ...previousDates };

        delete updatedDates[requirementId];

        return updatedDates;
      });
    }
  };

  const handleRemoveMatch = (requirementId) => {
    setMatches((previousMatches) => {
      const updatedMatches = { ...previousMatches };

      delete updatedMatches[requirementId];

      return updatedMatches;
    });

    setExpiryDates((previousDates) => {
      const updatedDates = { ...previousDates };

      delete updatedDates[requirementId];

      return updatedDates;
    });
  };

  const handleExpiryDateChange = (requirementId, value) => {
    setExpiryDates((previousDates) => {
      const updatedDates = { ...previousDates };

      if (value) {
        updatedDates[requirementId] = value;
      } else {
        delete updatedDates[requirementId];
      }

      return updatedDates;
    });
  };

  if (!requirements || requirements.length === 0) {
    return (
      <div className="match-panel">
        <p>No requirements loaded.</p>
      </div>
    );
  }

  return (
    <div className="match-panel">
      <h2>{language === "bn" ? "ডকুমেন্ট ম্যাচ করুন" : "Match Documents"}</h2>

      <p>
        {language === "bn"
          ? "প্রতিটি PDF সংশ্লিষ্ট রিকোয়ারমেন্টের সাথে ম্যাচ করুন। একটি ডকুমেন্ট শুধুমাত্র একবার ব্যবহার করা যাবে।"
          : "Match each uploaded PDF to the requirement it satisfies. A document can only be used once."}
      </p>

      <div className="match-list">
        {requirements.map((requirement) => {
          const matchedFile = getFileForRequirement(requirement.id);

          const requiresExpiry = requirement.has_expiry === true;

          const expiryDate = expiryDates[requirement.id] || "";

          return (
            <div className="match-card" key={requirement.id}>
              <div className="match-requirement">
                <strong>
                  {requirement.order}. {getRequirementTitle(requirement)}
                </strong>

                <span>
                  {requirement.mandatory
                    ? language === "bn"
                      ? "আবশ্যিক"
                      : "Mandatory"
                    : language === "bn"
                      ? "ঐচ্ছিক"
                      : "Optional"}
                </span>
              </div>

              <div className="match-control">
                <select
                  value={matchedFile?.id || ""}
                  onChange={(event) =>
                    handleMatch(requirement.id, event.target.value)
                  }
                >
                  <option value="">
                    {language === "bn"
                      ? "-- PDF নির্বাচন করুন --"
                      : "-- Select PDF --"}
                  </option>

                  {files.map((file) => {
                    const usedByRequirement = getMatchedRequirementId(file.id);

                    const isUsedByAnotherRequirement =
                      usedByRequirement && usedByRequirement !== requirement.id;

                    return (
                      <option
                        key={file.id}
                        value={file.id}
                        disabled={isUsedByAnotherRequirement}
                      >
                        {file.name}
                        {isUsedByAnotherRequirement
                          ? language === "bn"
                            ? " (ইতিমধ্যে ম্যাচ করা)"
                            : " (already matched)"
                          : ""}
                      </option>
                    );
                  })}
                </select>

                {matchedFile && (
                  <button
                    type="button"
                    className="remove-match-button"
                    onClick={() => handleRemoveMatch(requirement.id)}
                  >
                    {language === "bn" ? "ম্যাচ সরান" : "Remove Match"}
                  </button>
                )}
              </div>

              {matchedFile && (
                <p className="matched-file">
                  Matched: <strong>{matchedFile.name}</strong>
                </p>
              )}

              {requiresExpiry && (
                <div className="expiry-field">
                  <label htmlFor={`expiry-${requirement.id}`}>
                    {language === "bn" ? "মেয়াদ শেষের তারিখ" : "Expiry Date"}
                  </label>

                  <input
                    id={`expiry-${requirement.id}`}
                    type="date"
                    value={expiryDate}
                    onChange={(event) =>
                      handleExpiryDateChange(requirement.id, event.target.value)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MatchPanel;
