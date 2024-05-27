//---------------------------------------------------------------------------------------
// Copyright (c) 2023 by EadsGraphic LLC. All Rights Reserved.
// Consult README.md regarding legal and licensing information.
//---------------------------------------------------------------------------------------

import path from "path";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import ExcelJS from "exceljs";
import spdy from "spdy";
import express from "express";

import crypto from "node:crypto";
import { PDFNet } from "@pdftron/pdfnet-node";

require("dotenv").config();

const app = express();

app.use(express.json());

const CERT_DIR = `./cert`;
const PORT = 8000;

const {
  HTML2PDF,
  ContentReplacer,
  TextSearch,
  enableJavaScript,
  initialize,
  PDFDoc,
  SDFDoc,
  Stamper,
} = PDFNet;

// POST
// /api/v1/export/excel
app.get("/excel", async (req, res) => {
  try {
    const data = [
      { Name: "John", Age: 25, Country: "USA" },
      { Name: "Jane", Age: 30, Country: "Canada" },
      { Name: "Bob", Age: 28, Country: "UK" },
    ];

    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet("Report 1");

    // Add headers
    const headers = Object.keys(data[0]);
    sheet.addRow(headers);

    // Add data to the worksheet
    data.forEach((row) => {
      sheet.addRow(row);
    });

    wb.addWorksheet("Report 2");
    wb.addWorksheet("Report 3");

    const filename = `CLIENT_ID_NAME_MMDDYYYY`;
    const buffer = await wb.xlsx.writeBuffer({
      filename,
    });

    // Set response headers
    res.header("Content-Type", "application/ms-excel");
    res.header(
      "Content-Disposition",
      `attachment; filename="${filename}.xlsx"`
    );

    res.status(200).send(buffer);
  } catch (error) {
    res.status(400).send({ error: "Failed to export excel file." });
  }
});

app.get("/pdf", async (req, res) => {
  try {
    await initialize(process.env.APRYSE_KEY);

    // const name = randomUUID();

    // For HTML2PDF we need to locate the html2pdf module. If placed with the
    // PDFNet library, or in the current working directory, it will be loaded
    // automatically. Otherwise, it must be set manually using HTML2PDF.setModulePath.
    const htmlToPdfSDK = path.join(__dirname, "../src/modules", "html2pdf");
    initialize();
    // await enableJavaScript(false);

    await HTML2PDF.setModulePath(htmlToPdfSDK);

    if (!(await HTML2PDF.isModuleAvailable())) {
      throw new Error("APRYSE HTML2PDF Module was not found in this project.");
    }

    const sdk = await HTML2PDF.create();
    const settings = await HTML2PDF.WebPageSettings.create();

    const pdf = await PDFDoc.create();

    await pdf.initSecurityHandler();

    sdk.setLogFilePath(path.join(__dirname, "../html2pdf.log'"));

    const html = await fs.readFile(path.join(__dirname, "../index.html"), {
      encoding: "utf-8",
    });

    const header = await fs.readFile(path.join(__dirname, "./header.html"), {
      encoding: "utf-8",
    });

    const footer = await fs.readFile(path.join(__dirname, "./footer.html"), {
      encoding: "utf-8",
    });

    // const doc = await PDFDoc.createFromURL(
    //   "https://www.princexml.com/howcome/2016/samples/invoice/index.pdf"
    // );

    await sdk.insertFromHtmlString2(header, settings);
    // await sdk.convert(pdf);

    // const headerPDF = await PDFDoc.create();

    // await headerPDF.initSecurityHandler();

    // await sdk.insertFromHtmlString2(header, settings);
    // await sdk.convert(headerPDF);

    // await pdf.insertPages(0, doc, 1, 1, 0);
    await sdk.setMargins(".75in", ".75in", ".39in", ".39in");

    await sdk.setHeader(header);
    await sdk.setFooter(footer);

    await sdk.setLandscape(false);
    await sdk.insertFromHtmlString2(html, settings);
    await sdk.convert(pdf);

    // const stamper = await Stamper.create(
    //   PDFNet.Stamper.SizeType.e_relative_scale,
    //   1,
    //   1
    // );

    // await stamper.setAlignment(0, 0);

    // await stamper.showsOnPrint(true);

    // const page = await headerPDF.getPage(1);

    // const pgSet = await PDFNet.PageSet.createRange(1, await pdf.getPageCount());

    // await stamper.stampPage(pdf, page, pgSet);
    // await stamper.setAlignment(
    //   PDFNet.Stamper.HorizontalAlignment.e_horizontal_left,
    //   PDFNet.Stamper.VerticalAlignment.e_vertical_top
    // );
    // await stamper.setAsBackground(true);

    // save the document to a memory buffer

    const hash = crypto
      .createHash("sha512", { defaultEncoding: "utf-8" })
      .update("some_string")
      .digest("hex");

    const meta = await pdf.getDocInfo();
    await meta.setKeywords(`account_id_hash=${hash}`);
    console.log(`account_id_hash=${hash}`);

    async function hashPII(pdf: PDFNet.PDFDoc, text: string) {
      const hash = crypto.createHash("sha512").update(`${text}`).digest("hex");

      const meta = await pdf.getDocInfo();
      await meta.setKeywords(`account_id_hash=${hash}werewrewrewr`);

      const current = await pdf.getDocInfo();
      const c = await current.getKeywords();
      console.log(c);
      await meta.setKeywords(`account_id_hash=${hash}`);
      // console.log(`account_id_hash=${hash}`);
    }

    await hashPII(pdf, "cutomaccountid");

    await pdf.lock();

    const buffer = await pdf.saveMemoryBuffer(
      PDFNet.SDFDoc.SaveOptions.e_linearized
    );
    await pdf.unlock();

    // Set response headers
    res.header("Content-Type", "application/octet-stream");
    res.header("Content-Disposition", `attachment; filename="03122024.pdf"`);

    res.write(buffer);
    res.status(200).end();
  } catch {
    return res.status(400).end();
  }
});

// GET
// /apryse
app.get("/apryse", async (req, res) => {
  const main = async () => {
    try {
      // For HTML2PDF we need to locate the html2pdf module. If placed with the
      // PDFNet library, or in the current working directory, it will be loaded
      // automatically. Otherwise, it must be set manually using HTML2PDF.setModulePath.
      await PDFNet.HTML2PDF.setModulePath(
        path.join(__dirname, "../src/modules/html2pdf")
      );

      console.log(
        "module path",
        path.join(__dirname, "../src/modules/html2pdf")
      );

      if (!(await PDFNet.HTML2PDF.isModuleAvailable())) {
        console.log(
          "Unable to run HTML2PDFTest: Apryse SDK HTML2PDF module not available."
        );
        console.log(
          "---------------------------------------------------------------"
        );
        console.log(
          "The HTML2PDF module is an optional add-on, available for download"
        );
        console.log(
          "at https://www.pdftron.com/. If you have already downloaded this"
        );
        console.log(
          "module, ensure that the SDK is able to find the required files"
        );
        console.log("using the HTML2PDF.setModulePath() function.");

        return;
      }
      const html2pdf = await PDFNet.HTML2PDF.create();
      const doc = await PDFNet.PDFDoc.create();
      const html =
        "<html><body><h1>Heading</h1><p>Paragraph.</p></body></html>";

      html2pdf.insertFromHtmlString(html);
      await html2pdf.convert(doc);

      doc.save("./tyler.pdf", PDFNet.SDFDoc.SaveOptions.e_linearized);

      html2pdf.setLogFilePath("./tyler.log");

      res.status(200).json({ message: "Created Apryse PDF" });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: "Failed to ake Apryse PDF" });
    }
  };

  await PDFNet.runWithCleanup(
    main,
    "demo:1697313909377:7ce14fc80300000000c37f250af68c3cd6fc05121417418689d76a90fb"
  );
});

function createServer() {
  return spdy.createServer(
    {
      key: fsSync.readFileSync(`${CERT_DIR}/server.key`),
      cert: fsSync.readFileSync(`${CERT_DIR}/server.cert`),
    },
    app
  );
}

const server = createServer();

server.listen(PORT, () => {
  console.log(process.platform);
  console.log(`API Available @ https://localhost:${PORT}`);
});
