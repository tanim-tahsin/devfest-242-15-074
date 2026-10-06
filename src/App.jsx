import { useState } from "react";
import FileUploader from "./components/FileUploader";
import MatchPanel from "./components/MatchPanel";
import RequirementsList from "./components/RequirementsList";
import StatusBadge from "./components/StatusBadge";
import { generatePackagePdf } from "./utils/pdfUtils";
import { translations } from "./utils/translations";
import { getRequirementStatus, hasBlockingStatus } from "./utils/validation";

function App() {
  const [language, setLanguage] = useState("en");
  const [requirementsData, setRequirementsData] = useState(null);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [matches, setMatches] = useState({});
  const [expiryDates, setExpiryDates] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const t = translations[language];

  const handleRequirementsFile = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Please select a valid requirements.json file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.tender || !Array.isArray(data.requirements)) {
          throw new Error("Invalid requirements.json structure");
        }

        const sortedRequirements = [...data.requirements].sort(
          (a, b) => a.order - b.order,
        );

        setRequirementsData({
          ...data,
          requirements: sortedRequirements,
        });

        setMatches({});
        setExpiryDates({});
        setError("");
      } catch (err) {
        setRequirementsData(null);
        setError("Invalid requirements.json file.");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const getFileForRequirement = (requirementId) => {
    const fileId = matches[requirementId];

    if (!fileId) {
      return null;
    }

    return files.find((file) => file.id === fileId) || null;
  };

  const getStatus = (requirement) => {
    const matchedFile = getFileForRequirement(requirement.id);

    return getRequirementStatus(
      requirement,
      matchedFile,
      expiryDates[requirement.id],
      requirementsData?.tender?.submission_deadline,
    );
  };

  const blockingRequirements =
    requirementsData?.requirements.filter((requirement) =>
      hasBlockingStatus(getStatus(requirement)),
    ) || [];

  const canGenerate =
    requirementsData &&
    requirementsData.requirements.length > 0 &&
    blockingRequirements.length === 0 &&
    !isGenerating;

  const handleGenerate = async () => {
    if (!requirementsData || !canGenerate) {
      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      const pdf = await generatePackagePdf({
        tender: requirementsData.tender,
        requirements: requirementsData.requirements,
        matches,
        files,
      });

      const pdfBytes = await pdf.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${requirementsData.tender.tender_id}_Package.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(
        "Could not generate the PDF package. Please check the uploaded documents.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t.appTitle}</h1>
          <p>{t.appSubtitle}</p>
        </div>

        <div className="language-switch">
          <span>{t.language}:</span>

          <button
            onClick={() => setLanguage("en")}
            className={language === "en" ? "active" : ""}
          >
            {t.english}
          </button>

          <button
            onClick={() => setLanguage("bn")}
            className={language === "bn" ? "active" : ""}
          >
            {t.bangla}
          </button>
        </div>
      </header>

      <main>
        <section>
          <h2>Load Requirements</h2>

          <input
            type="file"
            accept=".json,application/json"
            onChange={handleRequirementsFile}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}
        </section>

        {requirementsData && (
          <section>
            <h2>{t.tenderInformation}</h2>

            <p>
              <strong>{t.tenderId}:</strong> {requirementsData.tender.tender_id}
            </p>

            <p>
              <strong>{t.title}:</strong> {requirementsData.tender.title}
            </p>

            <p>
              <strong>{t.procuringEntity}:</strong>{" "}
              {requirementsData.tender.procuring_entity}
            </p>

            <p>
              <strong>{t.bidder}:</strong> {requirementsData.tender.bidder}
            </p>

            <p>
              <strong>{t.submissionDeadline}:</strong>{" "}
              {requirementsData.tender.submission_deadline}
            </p>
          </section>
        )}

        {requirementsData && (
          <section>
            <h2>{t.requirements}</h2>

            <RequirementsList
              requirements={requirementsData.requirements}
              language={language}
            />

            <div className="status-summary">
              <h3>Requirement Status</h3>

              {requirementsData.requirements.map((requirement) => (
                <div className="status-row" key={requirement.id}>
                  <span>
                    {requirement.order}.{" "}
                    {language === "bn"
                      ? requirement.title_bn ||
                        requirement.title ||
                        requirement.name ||
                        requirement.id
                      : requirement.title_en ||
                        requirement.title ||
                        requirement.name ||
                        requirement.id}
                  </span>

                  <StatusBadge status={getStatus(requirement)} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>{t.uploadDocuments}</h2>

          <FileUploader files={files} setFiles={setFiles} />
        </section>

        {requirementsData && (
          <section>
            <MatchPanel
              requirements={requirementsData.requirements}
              files={files}
              matches={matches}
              setMatches={setMatches}
              expiryDates={expiryDates}
              setExpiryDates={setExpiryDates}
              language={language}
            />
          </section>
        )}

        {requirementsData && blockingRequirements.length > 0 && (
          <div className="generation-warning">
            <strong>Generation blocked.</strong>

            <p>Please fix the following requirement(s):</p>

            <ul>
              {blockingRequirements.map((requirement) => (
                <li key={requirement.id}>
                  {requirement.order}.{" "}
                  {requirement.title_en ||
                    requirement.title ||
                    requirement.name ||
                    requirement.id}{" "}
                  — {getStatus(requirement)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="generate-button"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {isGenerating ? "Generating..." : t.generatePackage}
        </button>
      </main>
    </div>
  );
}

export default App;
