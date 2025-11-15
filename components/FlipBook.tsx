"use client";

import { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
} from "react-feather";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FlipBookProps {
  bookSlug: string;
  pageCount: number;
  title: string;
}

export default function FlipBook({
  bookSlug,
  pageCount,
  title,
}: FlipBookProps) {
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 800 });
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [pdfSize, setPdfSize] = useState<string>("");
  const [isLoadingSize, setIsLoadingSize] = useState(false);

  const pages = Array.from(
    { length: pageCount },
    (_, i) => `/books/${bookSlug}/page-${i + 1}.webp`
  );

  // Haptic feedback function
  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      // Short vibration for button clicks (10ms)
      navigator.vibrate(10);
    }
  };

  // Fullscreen functions
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    // iOS doesn't support Fullscreen API, use CSS-based approach
    if (isIOS) {
      const newFullscreenState = !isFullscreen;
      setIsFullscreen(newFullscreenState);

      // Toggle fullscreen class on body/html for iOS
      if (newFullscreenState) {
        document.documentElement.classList.add("ios-fullscreen");
        document.body.classList.add("ios-fullscreen");
        document.documentElement.style.height = "100%";
        document.body.style.height = "100%";
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        // Hide address bar by scrolling to top
        window.scrollTo(0, 0);
        // Force viewport update
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      } else {
        document.documentElement.classList.remove("ios-fullscreen");
        document.body.classList.remove("ios-fullscreen");
        document.documentElement.style.height = "";
        document.body.style.height = "";
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
      return;
    }

    const element = containerRef.current;

    // Check for various fullscreen APIs (standard, webkit, ms)
    const requestFullscreen =
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).webkitEnterFullscreen ||
      (element as any).msRequestFullscreen;

    if (!document.fullscreenElement && requestFullscreen) {
      requestFullscreen
        .call(element)
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.log("Fullscreen not supported on this device");
        });
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    // iOS doesn't support Fullscreen API
    if (isIOS) {
      setIsFullscreen(false);
      document.documentElement.classList.remove("ios-fullscreen");
      document.body.classList.remove("ios-fullscreen");
      document.documentElement.style.height = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      return;
    }

    const exitFullscreen =
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).msExitFullscreen;

    if (document.fullscreenElement && exitFullscreen) {
      exitFullscreen.call(document).then(() => {
        setIsFullscreen(false);
      });
    } else {
      setIsFullscreen(false);
    }
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Fetch PDF size and show dialog
  const handleDownloadClick = async () => {
    const pdfUrl = `/books/${bookSlug}/book.pdf`;
    setIsLoadingSize(true);

    try {
      const response = await fetch(pdfUrl, { method: "HEAD" });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      
      const contentLength = response.headers.get("content-length");

      if (contentLength) {
        const sizeInBytes = parseInt(contentLength, 10);
        setPdfSize(formatFileSize(sizeInBytes));
      } else {
        // If content-length is not available, try fetching the file to get size
        const fullResponse = await fetch(pdfUrl);
        const blob = await fullResponse.blob();
        setPdfSize(formatFileSize(blob.size));
      }
      setShowDownloadDialog(true);
    } catch (error) {
      console.error("Error fetching PDF size:", error);
      setPdfSize("Unknown size");
      setShowDownloadDialog(true);
    } finally {
      setIsLoadingSize(false);
    }
  };

  // Confirm and download PDF
  const confirmDownload = () => {
    const link = document.createElement("a");
    link.href = `/books/${bookSlug}/book.pdf`;
    link.download = `book.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDownloadDialog(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentPage > 0) {
        bookRef.current?.pageFlip().flipPrev();
      } else if (e.key === "ArrowRight" && currentPage < pageCount - 1) {
        bookRef.current?.pageFlip().flipNext();
      } else if (e.key === "F11" || (e.key === "f" && e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, pageCount, isFullscreen]);

  // Mobile detection and window size tracking
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isIOSDevice = /iPhone|iPad|iPod/i.test(userAgent);
      setIsIOS(isIOSDevice);
      setIsMobile(
        window.innerWidth < 768 || isIOSDevice || /Android/i.test(userAgent)
      );
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mouse movement detection (desktop only)
  useEffect(() => {
    if (isMobile) {
      setShowControls(true); // Always show on mobile
      return;
    }

    let timer: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isMobile]);

  // Handle fullscreen change (non-iOS only)
  useEffect(() => {
    if (isIOS) return; // iOS doesn't support fullscreen API

    const handleFullscreenChange = () => {
      const isFullscreen =
        !!document.fullscreenElement ||
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).msFullscreenElement;
      setIsFullscreen(isFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, [isIOS]);

  // Disable scrollbar
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      // Cleanup iOS fullscreen classes
      document.documentElement.classList.remove("ios-fullscreen");
      document.body.classList.remove("ios-fullscreen");
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 flex items-center justify-center w-screen h-screen overflow-hidden ${
        isFullscreen && isIOS ? "ios-fullscreen" : ""
      }`}
      style={{
        backgroundColor: "transparent",
        ...(isFullscreen && isIOS
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
            }
          : {}),
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <HTMLFlipBook
          ref={bookRef}
          width={550}
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={windowSize.width - 40}
          minHeight={420}
          maxHeight={windowSize.height - 40}
          showCover={false}
          mobileScrollSupport={true}
          onFlip={(e) => setCurrentPage(e.data)}
          className="shadow-2xl"
          style={{ width: "100%", height: "100%" }}
          startPage={0}
          drawShadow={true}
          flippingTime={500}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={false}
          disableFlipByClick={false}
          clickEventForward={false}
          useMouseEvents={true}
          swipeDistance={30}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              className="bg-white relative"
              style={{ width: "100%", height: "100%" }}
            >
              <Image
                src={page}
                alt={`Page ${index + 1}`}
                fill
                className="object-contain"
                priority={index < 2}
              />
            </div>
          ))}
        </HTMLFlipBook>

        {/* Overlay Controls */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            showControls || isMobile ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Previous Button - Center Left (Always visible) */}
          <button
            onClick={() => {
              triggerHaptic();
              bookRef.current?.pageFlip().flipPrev();
            }}
            disabled={currentPage === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full border border-neutral-500/40 disabled:opacity-30 hover:bg-black/60 active:bg-black/70 transition-all pointer-events-auto backdrop-blur-sm flex items-center justify-center"
            style={{ zIndex: 1000 }}
            aria-label="Previous page"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button - Center Right (Always visible) */}
          <button
            onClick={() => {
              triggerHaptic();
              bookRef.current?.pageFlip().flipNext();
            }}
            disabled={currentPage === pageCount - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full border border-neutral-500/40 disabled:opacity-30 hover:bg-black/60 active:bg-black/70 transition-all pointer-events-auto backdrop-blur-sm flex items-center justify-center"
            style={{ zIndex: 1000 }}
            aria-label="Next page"
          >
            <ChevronRight size={24} />
          </button>

          {/* Page Number - Top Left on Mobile, Bottom Center on Desktop */}
          <div
            className={`absolute px-4 py-2 bg-black/40 text-white rounded-lg pointer-events-auto backdrop-blur-sm ${
              isMobile ? "top-4 left-4" : "bottom-8 left-1/2 -translate-x-1/2"
            }`}
            style={{ zIndex: 1000 }}
          >
            Page {currentPage + 1} / {pageCount}
          </div>
        </div>

        {/* Top Right Buttons */}
        <div
          className={`absolute top-4 right-4 flex gap-2 pointer-events-auto transition-opacity duration-300 ${
            showControls || isMobile ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 1000 }}
        >
          {/* Download PDF Button */}
          <button
            onClick={() => {
              triggerHaptic();
              handleDownloadClick();
            }}
            disabled={isLoadingSize}
            className="p-3 bg-black/60 text-white rounded-full border border-neutral-500/40 hover:bg-black/80 transition-all backdrop-blur-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Download PDF"
          >
            <Download size={20} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              triggerHaptic();
              toggleFullscreen();
            }}
            className="p-3 bg-black/60 text-white rounded-full border border-neutral-500/40 hover:bg-black/80 transition-all backdrop-blur-sm flex items-center justify-center"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Download Confirmation Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="bg-white text-black border border-neutral-200">
          <DialogHeader>
            <DialogTitle>Confirm Download</DialogTitle>
            <DialogDescription>
              Do you want to download this PDF?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-neutral-600">
              File size:{" "}
              <span className="font-semibold text-neutral-900">{pdfSize}</span>
            </p>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <button
              onClick={() => setShowDownloadDialog(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                confirmDownload();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-neutral-800 transition-colors"
            >
              Download
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
