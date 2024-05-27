const fs = require("node:fs/promises");
const fsSync = require("node:fs");

const PDFDocument = require("pdfkit");

// Function to create a PDF file
function createPDF(folderPath, fileName, content) {
  const filePath = `${folderPath}/${fileName}`;

  try {
    const doc = new PDFDocument();
    doc.pipe(fsSync.createWriteStream(filePath));
    doc.fontSize(18).text(`${content}`, 100, 100);
    doc.end();
  } catch (err) {
    console.error(`Error creating PDF file "${filePath}": ${err}`);
  }
}

/**
 * Creates test documents to upload against for document uploader.
 */
async function create() {
  await fs.rm("./test-docs", { recursive: true, force: true });
  await fs.mkdir("./test-docs", { recursive: true });
  await fs.mkdir("./test-docs/fund", { recursive: true });
  await fs.mkdir("./test-docs/institutional", { recursive: true });

  createPDF("./test-docs/fund", "fund.pdf", "Tyler Fund");
  createPDF(
    "./test-docs/institutional",
    "institutional.pdf",
    "Tyler institutional"
  );
}

create();
