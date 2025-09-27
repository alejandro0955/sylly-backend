import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
// PDF parsing (browser)
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

// DOCX parsing (browser)
import * as mammoth from "mammoth/mammoth.browser";

/**
 * FileDropAndParse.jsx
 * Drag-and-drop a PDF or DOCX file and extract raw text entirely in the browser.
 */
export default function FileDropAndParse({
    initialText = "",
    onTextChange,
    variant = "full",
    className = "",
    heading = "File-to-Raw Text Extractor",
    subheading = "Drop in a PDF, DOCX, or TXT. Everything runs in your browser.",
    footerNote = "Having trouble with old .doc files or huge PDFs? Offload to a server (LibreOffice + mammoth, or pdf-parse) and return text over an API.",
}) {
    const [text, setText] = useState(initialText);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialText !== text) {
            setText(initialText);
        }
    }, [initialText, text]);

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

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            fullText += `${strings.join(" ")}\n\n`;
        }

        return fullText.trim();
    }, []);

    const parseDocx = useCallback(async (file) => {
        const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        return value?.trim?.() ?? "";
    }, []);

    const parseTxt = useCallback((file) => file.text(), []);

    const MIME_PARSERS = useMemo(
        () => ({
            "application/pdf": parsePdf,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": parseDocx,
            "text/plain": parseTxt,
        }),
        [parseDocx, parsePdf, parseTxt]
    );

    const EXTENSION_PARSERS = useMemo(
        () => ({
            ".pdf": parsePdf,
            ".docx": parseDocx,
            ".txt": parseTxt,
        }),
        [parseDocx, parsePdf, parseTxt]
    );

    const ACCEPTED_TYPES = useMemo(
        () => ({
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "text/plain": [".txt"],
        }),
        []
    );

    const parseFile = useCallback(
        async (file) => {
            if (!file) return "";

            const parser = MIME_PARSERS[file.type];
            if (parser) return parser(file);

            const extension = file.name?.toLowerCase?.().match(/\.[^.]+$/)?.[0];
            const fallbackParser = extension && EXTENSION_PARSERS[extension];
            if (fallbackParser) return fallbackParser(file);

            throw new Error(`Unsupported file type: ${file.type || "unknown"}. Try PDF, DOCX, or TXT.`);
        },
        [EXTENSION_PARSERS, MIME_PARSERS]
    );

    const onDrop = useCallback(
        async ([file]) => {
            if (!file) return;

            setError("");
            handleSetText("");
            setFileName(file.name);
            setLoading(true);

            try {
                handleSetText(await parseFile(file));
            } catch (e) {
                console.error(e);
                setError(e?.message || "Failed to parse file.");
            } finally {
                setLoading(false);
            }
        },
        [handleSetText, parseFile]
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
                        {isDragActive ? "Release to drop the file" : "Drag & drop a file here"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">or click to choose</div>
                    <div className="text-xs text-gray-500 mt-3">Accepted: PDF, DOCX, TXT - Max 25MB</div>
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

                <textarea
                    className="w-full h-[50vh] p-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Extracted text will appear here..."
                    value={text}
                    onChange={(e) => handleSetText(e.target.value)}
                />

                {text && (
                    <div className="text-xs text-gray-500">
                        {new Intl.NumberFormat().format(text.length)} characters extracted
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