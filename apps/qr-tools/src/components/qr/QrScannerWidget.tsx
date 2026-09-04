import { useEffect, useRef, useState } from "react";
import Dropzone from "./Dropzone";
import { decodeQrFromImage, decodeQrFromImageData } from "@/lib/qr/decode";

interface ScanEntry {
  id: string;
  text: string;
  source: "image" | "camera";
}

function isLikelyUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function QrScannerWidget() {
  const [results, setResults] = useState<ScanEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTextRef = useRef<string | null>(null);

  useEffect(() => {
    setCameraSupported(typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
    return () => stopCamera();
  }, []);

  function addResult(entry: Omit<ScanEntry, "id">) {
    setResults((prev) => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...entry }, ...prev]);
  }

  async function handleFiles(files: File[]) {
    setError(null);
    for (const file of files) {
      try {
        const result = await decodeQrFromImage(file);
        if (result) {
          addResult({ text: result.text, source: "image" });
        } else {
          setError(`No QR code found in "${file.name}".`);
        }
      } catch {
        setError(`Couldn't read "${file.name}" as an image.`);
      }
    }
  }

  function scanLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_CURRENT_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = decodeQrFromImageData(imageData);
      if (result && result.text !== lastTextRef.current) {
        lastTextRef.current = result.text;
        addResult({ text: result.text, source: "camera" });
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      lastTextRef.current = null;
      setCameraActive(true);
      rafRef.current = requestAnimationFrame(scanLoop);
    } catch {
      setError("Camera access was denied or isn't available on this device. You can still upload an image below.");
    }
  }

  function stopCamera() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function handleCopy(entry: ScanEntry) {
    try {
      await navigator.clipboard.writeText(entry.text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId((id) => (id === entry.id ? null : id)), 1500);
    } catch {
      // Clipboard API unavailable — nothing to fall back to safely; the text is already visible to select/copy manually.
    }
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">QR code scanner</p>
      </div>

      <div className="space-y-4 p-5">
        {cameraSupported && (
          <div className="overflow-hidden rounded-card border border-neutral-200 bg-neutral-900">
            <video ref={videoRef} className={`w-full ${cameraActive ? "block" : "hidden"}`} playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraActive && (
              <button
                type="button"
                onClick={startCamera}
                className="flex w-full items-center justify-center gap-2 px-4 py-10 text-sm font-semibold text-white"
              >
                Use camera to scan
              </button>
            )}
          </div>
        )}
        {cameraActive && (
          <button
            type="button"
            onClick={stopCamera}
            className="w-full rounded-control border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Stop camera
          </button>
        )}

        <Dropzone onFiles={handleFiles} label="Drag & drop a QR code image, or click to browse" hint="Upload a screenshot or photo containing a QR code" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {results.length > 0 && (
          <div className="space-y-2 border-t border-neutral-100 pt-4">
            <p className="text-sm font-semibold text-neutral-800">Decoded results</p>
            {results.map((entry) => (
              <div key={entry.id} className="rounded-control border border-neutral-200 bg-neutral-50 p-3">
                <p className="break-all text-sm text-neutral-800">{entry.text}</p>
                <div className="mt-2 flex gap-3 text-xs">
                  <button type="button" onClick={() => handleCopy(entry)} className="font-semibold text-accent-600 hover:text-accent-700">
                    {copiedId === entry.id ? "Copied!" : "Copy"}
                  </button>
                  {isLikelyUrl(entry.text) && (
                    <a href={entry.text} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-600 hover:text-accent-700">
                      Open link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
