/**
 * Generates a strip of small JPEG thumbnails from a local video file by
 * seeking a hidden <video> element and drawing each frame to a canvas. A
 * blob: URL is same-origin, so the canvas is never tainted and toDataURL
 * works with no server round-trip — this is the same trick video editors'
 * scrubber previews use, just running entirely client-side here.
 */
export async function generateThumbnails(file: File, count: number, duration: number): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Could not read video frames for thumbnails."));
    });

    const canvas = document.createElement("canvas");
    const scale = video.videoWidth ? 120 / video.videoWidth : 1;
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale)) || 120;
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale)) || 68;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");

    const thumbnails: string[] = [];
    for (let i = 0; i < count; i++) {
      const target = Math.min(Math.max(duration - 0.05, 0), (duration * i) / count);
      await seekTo(video, target);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      thumbnails.push(canvas.toDataURL("image/jpeg", 0.6));
    }

    return thumbnails;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}
