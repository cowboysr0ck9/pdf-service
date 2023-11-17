//---------------------------------------------------------------------------------------
// Copyright (c) 2023 by EadsGraphic LLC. All Rights Reserved.
// Consult README.md regarding legal and licensing information.
//---------------------------------------------------------------------------------------

import express, { NextFunction, Request, Response } from "express";
import path from "path";
import * as fs from "node:fs/promises";
import { randomUUID } from "crypto";
import { PDFNet } from "@pdftron/pdfnet-node"; // you may need to set up NODE_PATH environment variable to make this work.
import { CosmosClient } from "@azure/cosmos";
import SignalR from "@microsoft/signalr";
import mongoose from "mongoose";
import { safeConnect } from "./server/mongo";
import {
  Visualization,
  visualizationValidator,
} from "./server/models/visualization.model";

require("dotenv").config();

const server = express();

// const connection = new SignalR.HubConnectionBuilder()
//   .withUrl("http://127.0.0.1:7265/chathub")
//   .configureLogging(SignalR.LogLevel.Information)
//   .build();
server.use(express.json());
server.use((request: Request, response: Response, next: NextFunction) => {
  // Access the request headers
  const headers = request.headers;
  const cache = new Map(
    Object.entries(headers).map(([key, val]) => [key, val])
  );

  // // Authorization Token
  // if (!cache.has("Authorization")) {
  //   console.error("No Authorization Token provided");
  // }

  // // Authorization Token
  // if (!cache.has("Firm")) {
  //   console.error("No firm id provided");
  // }

  // // Authorization Token
  // if (!cache.has("User")) {
  //   console.error("No user id provided");
  // }

  next();
});
const {
  HTML2PDF,
  ContentReplacer,
  TextSearch,
  enableJavaScript,
  initialize,
  PDFDoc,
  SDFDoc,
} = PDFNet;

server.get("/", async (req: Request, res: Response) => {
  try {
    await initialize(process.env.APRYSE_KEY);

    const name = randomUUID();

    // For HTML2PDF we need to locate the html2pdf module. If placed with the
    // PDFNet library, or in the current working directory, it will be loaded
    // automatically. Otherwise, it must be set manually using HTML2PDF.setModulePath.
    const htmlToPdfSDK = path.join(__dirname, "../src/modules", "HTML2PDFMac");
    initialize();
    await enableJavaScript(true);

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
    const doc = await PDFDoc.createFromURL(
      "https://www.princexml.com/howcome/2016/samples/invoice/index.pdf"
    );

    await pdf.insertPages(0, doc, 1, 1, 0);
    await sdk.setMargins(".39in", ".39in", ".39in", ".39in");

    await sdk.setHeader(header);
    await sdk.setFooter(footer);

    await settings.setPrintBackground(true);

    await sdk.setLandscape(false);
    await sdk.insertFromHtmlString2(html, settings);

    await sdk.convert(pdf);

    await pdf.save(`dist/${name}.pdf`, SDFDoc.SaveOptions.e_linearized);

    return res
      .status(200)
      .sendFile(path.join(__dirname, `../dist/${name}.pdf`));
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create PDF report.",
    });
  }
});

server.get("/visualizations", async (req: Request, res: Response) => {
  try {
    const visuals = await Visualization.find()
      .where("firm")
      .equals(req.headers["firm"]);

    return res.status(200).json(
      visuals.map((v) => {
        return {
          id: v._id,
          name: v.name,
          description: v.description,
        };
      })
    );
  } catch {
    return res.status(400).json({ message: "failure" });
  }
});

server.get("/visualizations/:id", async (req: Request, res: Response) => {
  try {
    const visual = await Visualization.findById(req.params["id"]);
    return res.status(200).json(visual);
  } catch {
    return res.status(400).json({ message: "failure" });
  }
});

server.post("/visualizations", async (req: Request, res: Response) => {
  try {
    console.log(JSON.stringify(req.body));
    const isValid = visualizationValidator.safeParse(req.body);

    if (!isValid.success) {
      return res.status(400).json({ message: `${isValid.error}` });
    }

    const visual = new Visualization(isValid.data);
    await visual.save();

    return res.status(200).json(visual);
  } catch {
    return res.status(400).json({ message: "failure" });
  }
});

server.put("/visualizations/:id", async (req: Request, res: Response) => {
  try {
    const isValid = visualizationValidator.safeParse(req.body);

    if (!isValid.success) {
      return res.status(400).json({ message: `${isValid.error}` });
    }

    await Visualization.findByIdAndUpdate(req.params["id"], isValid.data, {
      new: true,
    });
    return res.status(200).json({
      message: `Successfully updated visualization ${req.params["id"]}`,
    });
  } catch {
    return res.status(400).json({ message: "failure" });
  }
});

server.delete("/visualizations/:id", async (req: Request, res: Response) => {
  try {
    await Visualization.findByIdAndDelete(req.params["id"]);
    return res.status(200).json({
      message: `Successfully deleted visualization ${req.params["id"]}`,
    });
  } catch {
    return res.status(400).json({ message: "failure" });
  }
});

server.delete("/visualizations", async (req: Request, res: Response) => {
  try {
    await Visualization.deleteMany();
    return res.status(200).json({
      message: `Successfully deleted all visualizations`,
    });
  } catch {
    return res.status(400).json({ message: "failure" });
  }
});

server.listen(process.env.SERVER_PORT, async () => {
  try {
    await safeConnect();
  } catch {
    console.error("error");
  }
  console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
});
