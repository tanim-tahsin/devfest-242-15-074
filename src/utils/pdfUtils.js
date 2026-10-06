import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export async function getPdfPageCount(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  return pdf.numPages;
}

export async function generatePackagePdf({
  tender,
  requirements,
  matches,
  files,
}) {
  const finalPdf = await PDFDocument.create();

  const font = await finalPdf.embedFont(StandardFonts.Helvetica);

  const boldFont = await finalPdf.embedFont(StandardFonts.HelveticaBold);

  // =========================
  // COVER PAGE
  // =========================

  const coverPage = finalPdf.addPage();

  const { width, height } = coverPage.getSize();

  coverPage.drawText("TENDER DOCUMENT PACKAGE", {
    x: 50,
    y: height - 80,
    size: 22,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  coverPage.drawText(`Tender ID: ${tender.tender_id || ""}`, {
    x: 50,
    y: height - 130,
    size: 12,
    font,
  });

  coverPage.drawText(`Tender Title: ${tender.title || ""}`, {
    x: 50,
    y: height - 160,
    size: 12,
    font,
  });

  coverPage.drawText(`Procuring Entity: ${tender.procuring_entity || ""}`, {
    x: 50,
    y: height - 190,
    size: 12,
    font,
  });

  coverPage.drawText(`Bidder: ${tender.bidder || ""}`, {
    x: 50,
    y: height - 220,
    size: 12,
    font,
  });

  coverPage.drawText(
    `Submission Deadline: ${tender.submission_deadline || ""}`,
    {
      x: 50,
      y: height - 250,
      size: 12,
      font,
    },
  );

  coverPage.drawText(
    `Package Creation Date: ${new Date().toLocaleDateString()}`,
    {
      x: 50,
      y: height - 280,
      size: 12,
      font,
    },
  );

  let y = height - 340;

  coverPage.drawText("Included Documents", {
    x: 50,
    y,
    size: 15,
    font: boldFont,
  });

  y -= 30;

  for (const requirement of requirements) {
    const fileId = matches[requirement.id];

    if (!fileId) {
      continue;
    }

    const file = files.find((item) => item.id === fileId);

    if (!file) {
      continue;
    }

    const title =
      requirement.title_en ||
      requirement.title ||
      requirement.name ||
      requirement.id;

    coverPage.drawText(`${requirement.order}. ${title} — ${file.name}`, {
      x: 60,
      y,
      size: 10,
      font,
    });

    y -= 20;

    if (y < 60) {
      break;
    }
  }

  // =========================
  // MERGE DOCUMENTS
  // =========================

  for (const requirement of requirements) {
    const fileId = matches[requirement.id];

    if (!fileId) {
      continue;
    }

    const file = files.find((item) => item.id === fileId);

    if (!file) {
      continue;
    }

    const sourceBytes = await file.file.arrayBuffer();

    const sourcePdf = await PDFDocument.load(sourceBytes);

    const pageIndexes = sourcePdf.getPages().map((_, index) => index);

    const copiedPages = await finalPdf.copyPages(sourcePdf, pageIndexes);

    copiedPages.forEach((page) => {
      finalPdf.addPage(page);
    });
  }

  // =========================
  // ADD FOOTER TO EVERY PAGE
  // =========================

  const totalPages = finalPdf.getPageCount();

  const tenderId = tender.tender_id || "";

  finalPdf.getPages().forEach((page, index) => {
    const pageNumber = index + 1;

    const { width } = page.getSize();

    const footerText = `${tenderId} | Page ${pageNumber} of ${totalPages}`;

    const footerSize = 8;

    const textWidth = font.widthOfTextAtSize(footerText, footerSize);

    const footerX = (width - textWidth) / 2;

    page.drawText(footerText, {
      x: footerX,
      y: 15,
      size: footerSize,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
  });

  return finalPdf;
}
