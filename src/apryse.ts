//---------------------------------------------------------------------------------------
// Copyright (c) 2001-2024 by Apryse Software Inc. All Rights Reserved.
// Consult legal.txt regarding legal and license information.
//---------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------
// The following sample illustrates how to convert HTML pages to PDF format using
// the HTML2PDF class.
//
// 'pdftron.PDF.HTML2PDF' is an optional PDFNet Add-On utility class that can be
// used to convert HTML web pages into PDF documents by using an external module (html2pdf).
//
// html2pdf modules can be downloaded from http://www.pdftron.com/pdfnet/downloads.html.
//
// Users can convert HTML pages to PDF using the following operations:
// - Simple one line static method to convert a single web page to PDF.
// - Convert HTML pages from URL or string, plus optional table of contents, in user defined order.
// - Optionally configure settings for proxy, images, java script, and more for each HTML page.
// - Optionally configure the PDF output, including page size, margins, orientation, and more.
// - Optionally add table of contents, including setting the depth and appearance.
//---------------------------------------------------------------------------------------

const { PDFNet } = require("@pdftron/pdfnet-node");

((exports) => {
  "use strict";

  exports.runHTML2PDFTest = () => {
    const main = async () => {
      const outputPath = "../TestFiles/Output/html2pdf_example";
      const host = "https://docs.apryse.com";
      const page0 = "/";
      const page1 = "/all-products/";
      const page2 = "/documentation/web/faq";

      // For HTML2PDF we need to locate the html2pdf module. If placed with the
      // PDFNet library, or in the current working directory, it will be loaded
      // automatically. Otherwise, it must be set manually using HTML2PDF.setModulePath.
      await PDFNet.HTML2PDF.setModulePath("../../lib/");

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

      //--------------------------------------------------------------------------------
      // Example 1) Simple conversion of a web page to a PDF doc.

      try {
        const html2pdf = await PDFNet.HTML2PDF.create();
        const doc = await PDFNet.PDFDoc.create();

        html2pdf.insertFromUrl(host.concat(page0));
        // now convert a web page, sending generated PDF pages to doc
        await html2pdf.convert(doc);
        doc.save(
          outputPath.concat("_01.pdf"),
          PDFNet.SDFDoc.SaveOptions.e_linearized
        );
      } catch (err) {
        console.log(err);
      }

      //--------------------------------------------------------------------------------
      // Example 2) Modify the settings of the generated PDF pages and attach to an
      // existing PDF document.

      try {
        // open the existing PDF, and initialize the security handler
        const doc = await PDFNet.PDFDoc.createFromFilePath(
          "../TestFiles/numbered.pdf"
        );
        await doc.initSecurityHandler();

        // create the HTML2PDF converter object and modify the output of the PDF pages
        const html2pdf = await PDFNet.HTML2PDF.create();
        html2pdf.setPaperSize(PDFNet.PrinterMode.PaperSize.e_11x17);

        // insert the web page to convert
        html2pdf.insertFromUrl(host.concat(page0));

        // convert the web page, appending generated PDF pages to doc
        await html2pdf.convert(doc);
        doc.save(
          outputPath.concat("_02.pdf"),
          PDFNet.SDFDoc.SaveOptions.e_linearized
        );
      } catch (err) {
        console.log(err);
      }

      //--------------------------------------------------------------------------------
      // Example 3) Convert multiple web pages

      try {
        // convert page 0 into pdf
        const doc = await PDFNet.PDFDoc.create();

        const converter = await PDFNet.HTML2PDF.create();

        const header =
          "<div style='width:15%;margin-left:0.5cm;text-align:left;font-size:10px;color:#0000FF'><span class='date'></span></div><div style='width:70%;direction:rtl;white-space:nowrap;overflow:hidden;text-overflow:clip;text-align:center;font-size:10px;color:#0000FF'><span>PDFTRON HEADER EXAMPLE</span></div><div style='width:15%;margin-right:0.5cm;text-align:right;font-size:10px;color:#0000FF'><span class='pageNumber'></span> of <span class='totalPages'></span></div>";
        const footer =
          "<div style='width:15%;margin-left:0.5cm;text-align:left;font-size:7px;color:#FF00FF'><span class='date'></span></div><div style='width:70%;direction:rtl;white-space:nowrap;overflow:hidden;text-overflow:clip;text-align:center;font-size:7px;color:#FF00FF'><span>PDFTRON FOOTER EXAMPLE</span></div><div style='width:15%;margin-right:0.5cm;text-align:right;font-size:7px;color:#FF00FF'><span class='pageNumber'></span> of <span class='totalPages'></span></div>";
        converter.setHeader(header);
        converter.setFooter(footer);
        converter.setMargins("1cm", "2cm", ".5cm", "1.5cm");
        const settings = await PDFNet.HTML2PDF.WebPageSettings.create();
        await settings.setZoom(0.5);
        converter.insertFromUrl2(host.concat(page0), settings);
        await converter.convert(doc);

        // convert page 1 with the same settings, appending generated PDF pages to doc
        converter.insertFromUrl2(host.concat(page1), settings);
        await converter.convert(doc);

        // convert page 2 with different settings, appending generated PDF pages to doc
        const another_converter = await PDFNet.HTML2PDF.create();
        another_converter.setLandscape(true);
        const another_settings = await PDFNet.HTML2PDF.WebPageSettings.create();
        another_settings.setPrintBackground(false);
        another_converter.insertFromUrl2(host.concat(page2), another_settings);
        await another_converter.convert(doc);

        doc.save(
          outputPath.concat("_03.pdf"),
          PDFNet.SDFDoc.SaveOptions.e_linearized
        );
      } catch (err) {
        console.log(err);
      }

      //--------------------------------------------------------------------------------
      // Example 4) Convert HTML string to PDF.

      try {
        const html2pdf = await PDFNet.HTML2PDF.create();
        const doc = await PDFNet.PDFDoc.create();
        const html =
          "<html><body><h1>Heading</h1><p>Paragraph.</p></body></html>";

        html2pdf.insertFromHtmlString(html);
        await html2pdf.convert(doc);
        doc.save(
          outputPath.concat("_04.pdf"),
          PDFNet.SDFDoc.SaveOptions.e_linearized
        );
      } catch (err) {
        console.log(err);
      }

      //--------------------------------------------------------------------------------
      // Example 5) Set the location of the log file to be used during conversion.

      try {
        const html2pdf = await PDFNet.HTML2PDF.create();
        const doc = await PDFNet.PDFDoc.create();
        html2pdf.setLogFilePath("../TestFiles/Output/html2pdf.log");
        html2pdf.insertFromUrl(host.concat(page0));
        await html2pdf.convert(doc);
        doc.save(
          outputPath.concat("_05.pdf"),
          PDFNet.SDFDoc.SaveOptions.e_linearized
        );
      } catch (err) {
        console.log(err);
      }

      console.log("Test Complete!");
    };
    PDFNet.runWithCleanup(
      main,
      "demo:1697313909377:7ce14fc80300000000c37f250af68c3cd6fc05121417418689d76a90fb"
    )
      .catch((err: any) => () => {
        console.log("Error: " + JSON.stringify(err, null, 4));
      })
      .then(function () {
        return PDFNet.shutdown();
      });
  };
  exports.runHTML2PDFTest();
})(exports);
