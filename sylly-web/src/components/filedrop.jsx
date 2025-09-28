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
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
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
      if (file.type !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf")) {
        throw new Error("Unsupported file type. Please upload a PDF file.");
      }

      const [extractedText, dataUrl] = await Promise.all([parsePdf(file), readFileAsDataUrl(file)]);
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
    isFullVariant
      ? "min-h-screen w-full p-6 grid gap-6 bg-gray-50"
      : "w-full p-6 grid gap-4 bg-white border border-gray-200 rounded-2xl"
  } ${className}`.trim();

  const formatNumber = useMemo(() => new Intl.NumberFormat(), []);

  return (
    <div className={containerClassName}>
      <header className={isFullVariant ? "max-w-3xl" : "max-w-full"}>
        <h1 className={isFullVariant ? "text-2xl font-semibold" : "text-xl font-semibold"}>{heading}</h1>
        <p className="text-sm text-gray-600 mt-1">{subheading}</p>
      </header>

      <div
        {...getRootProps()}
        className={`max-w-3xl border-2 border-dashed rounded-2xl p-10 transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="text-lg font-medium">
            {isDragActive ? "Release to drop the PDF" : "Drag & drop a PDF here"}
          </div>
          <div className="text-sm text-gray-600 mt-1">or click to choose</div>
          <div className="text-xs text-gray-500 mt-3">Accepted: PDF • Max 25MB</div>
        </div>
      </div>

      <section className={isFullVariant ? "max-w-3xl grid gap-3" : "max-w-full grid gap-3"}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 truncate">
            {fileName ? (
              <span>
                <strong>Selected:</strong> {fileName}
              </span>
            ) : (
              "No file yet"
            )}
          </div>
          {loading && <div className="text-sm animate-pulse">Extracting...</div>}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {showTextArea ? (
          <>
            <textarea
              className="w-full h-[50vh] p-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Extracted text will appear here..."
              value={text}
              onChange={(e) => handleSetText(e.target.value)}
            />
            {text && (
              <div className="text-xs text-gray-500">
                {formatNumber.format(text.length)} characters extracted
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
            {text
              ? `Extracted ${formatNumber.format(text.length)} characters from the PDF.`
              : 'Drop a PDF to extract its contents automatically.'}
          </div>
        )}
      </section>

      {footerNote && (
        <footer className={isFullVariant ? "max-w-3xl text-xs text-gray-500" : "text-xs text-gray-500"}>
          <p>{footerNote}</p>
        </footer>
      )}
    </div>
  );
}

