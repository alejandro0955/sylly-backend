import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/**
 * FileDropAndParse.jsx
 * Drag-and-drop a PDF file, extract text, and emit the original PDF data URL.
 */
export default function FileDropAndParse({
  initialText = "",
  onTextChange,
  onFileData,
  variant = "full",
  className = "",
  heading = "PDF Text Extractor",
  subheading = "Drop in a PDF. Everything runs in your browser.",
  footerNote = "",
  showTextArea = true,
}) {
  const [text, setText] = useState(initialText);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSetText = useCallback(
    (value) => {
      setText(value);
      onTextChange?.(value);
    },
    [onTextChange]
  );

  const parsePdf = useCallback(async (file) => {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() })
      .promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      fullText += `${strings.join(" ")}\n\n`;
    }

    return fullText.trim();
  }, []);

  const ACCEPTED_TYPES = useMemo(
    () => ({
      "application/pdf": [".pdf"],
    }),
    []
  );

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read PDF file."));
      reader.readAsDataURL(file);
    });

  const parseFile = useCallback(
    async (file) => {
      if (!file) return { text: "", dataUrl: "" };
      if (
        file.type !== "application/pdf" &&
        !file.name?.toLowerCase().endsWith(".pdf")
      ) {
        throw new Error("Unsupported file type. Please upload a PDF file.");
      }

      const [extractedText, dataUrl] = await Promise.all([
        parsePdf(file),
        readFileAsDataUrl(file),
      ]);
      return { text: extractedText, dataUrl };
    },
    [parsePdf]
  );

  const onDrop = useCallback(
    async ([file]) => {
      if (!file) return;

      setError("");
      setFileName(file.name);
      setLoading(true);

      try {
        const { text: extractedText, dataUrl } = await parseFile(file);
        handleSetText(extractedText);
        onFileData?.(dataUrl);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to parse file.");
        handleSetText("");
        onFileData?.("");
      } finally {
        setLoading(false);
      }
    },
    [handleSetText, onFileData, parseFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: ACCEPTED_TYPES,
    maxSize: 25 * 1024 * 1024,
  });

  const isFullVariant = variant === "full";
  const containerClassName = `${
    isFullVariant ? "extractor-full" : "extractor-compact"
  } ${className}`.trim();

  const formatNumber = useMemo(() => new Intl.NumberFormat(), []);

  return (
    <div className={containerClassName}>
      <header className="extractor-header">
        <h1>{heading}</h1>
        <p className="muted">{subheading}</p>
      </header>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="dropzone-title">
            {isDragActive
              ? "Release to drop the PDF"
              : "Drag & drop a PDF here"}
          </div>
          <div className="dropzone-subtitle">or click to choose</div>
          <div className="dropzone-info">Accepted: PDF • Max 25MB</div>
        </div>
      </div>

      <section className="extractor-body">
        <div className="row space-between">
          <div className="text-sm">
            {fileName ? (
              <span>
                <strong>Selected:</strong> {fileName}
              </span>
            ) : (
              "No file yet"
            )}
          </div>
          {loading && <div className="loading-skeleton">Extracting...</div>}
        </div>

        {error && <div className="status-error">{error}</div>}

        {showTextArea ? (
          <>
            <textarea
              className="extractor-textarea"
              placeholder="Extracted text will appear here..."
              value={text}
              onChange={(e) => handleSetText(e.target.value)}
            />
            {text && (
              <div className="muted">
                {formatNumber.format(text.length)} characters extracted
              </div>
            )}
          </>
        ) : (
          <div className="status-info">
            {text
              ? `Extracted ${formatNumber.format(
                  text.length
                )} characters from the PDF.`
              : "Drop a PDF to extract its contents automatically."}
          </div>
        )}
      </section>

      {footerNote && <footer className="muted">{footerNote}</footer>}
    </div>
  );
}
