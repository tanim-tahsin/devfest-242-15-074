import { useRef } from "react";
import { getPdfPageCount } from "../utils/pdfUtils";
import { getFileHash } from "../utils/validation";

function FileUploader({ files, setFiles }) {
  const inputRef = useRef(null);

  const handleFiles = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf",
    );

    const invalidFiles = selectedFiles.filter(
      (file) => file.type !== "application/pdf",
    );

    if (invalidFiles.length > 0) {
      alert(
        `Rejected ${invalidFiles.length} non-PDF file(s). Only PDF files are allowed.`,
      );
    }

    const newFiles = [];

    for (const file of pdfFiles) {
      try {
        const pageCount = await getPdfPageCount(file);
        const hash = await getFileHash(file);

        newFiles.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          hash,
        });
      } catch (error) {
        console.error(error);

        alert(
          `Could not read "${file.name}". The PDF may be damaged or password protected.`,
        );
      }
    }

    setFiles((previousFiles) => {
      const existingIds = new Set(previousFiles.map((item) => item.id));

      const existingHashes = new Set(previousFiles.map((item) => item.hash));

      const uniqueNewFiles = [];

      for (const item of newFiles) {
        if (existingIds.has(item.id)) {
          continue;
        }

        if (existingHashes.has(item.hash)) {
          alert(
            `"${item.name}" is an exact duplicate of an already uploaded PDF.`,
          );
          continue;
        }

        const duplicateInCurrentSelection = uniqueNewFiles.some(
          (existingItem) => existingItem.hash === item.hash,
        );

        if (duplicateInCurrentSelection) {
          alert(
            `"${item.name}" is an exact duplicate of another selected PDF.`,
          );
          continue;
        }

        uniqueNewFiles.push(item);
      }

      return [...previousFiles, ...uniqueNewFiles];
    });

    event.target.value = "";
  };

  const removeFile = (id) => {
    setFiles((previousFiles) => previousFiles.filter((item) => item.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="file-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
      />

      <button
        type="button"
        className="upload-button"
        onClick={() => inputRef.current?.click()}
      >
        Select PDF Files
      </button>

      {files.length === 0 ? (
        <p className="empty-message">No PDF files selected.</p>
      ) : (
        <div className="uploaded-files">
          {files.map((item, index) => (
            <div className="file-card" key={item.id}>
              <div className="file-info">
                <strong>
                  {index + 1}. {item.name}
                </strong>

                <p>
                  <span>{formatFileSize(item.size)}</span>
                  {" • "}
                  <span>
                    {item.pageCount} {item.pageCount === 1 ? "page" : "pages"}
                  </span>
                </p>

                {item.hash && <small>Exact content check: completed</small>}
              </div>

              <button
                type="button"
                className="remove-button"
                onClick={() => removeFile(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="file-summary">
          {files.length} PDF {files.length === 1 ? "file" : "files"} uploaded
        </p>
      )}
    </div>
  );
}

export default FileUploader;
