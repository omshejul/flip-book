"use client";

import { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import Image from "next/image";

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

  const pages = Array.from(
    { length: pageCount },
    (_, i) => `/books/${bookSlug}/page-${i + 1}.jpg`
  );

  // Fullscreen functions
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = `/books/${bookSlug}/book.pdf`;
    link.download = `${bookSlug}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Mouse movement detection
  useEffect(() => {
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
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Disable scrollbar
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <HTMLFlipBook
          ref={bookRef}
          width={550}
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={420}
          maxHeight={1350}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={(e) => setCurrentPage(e.data)}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
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
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Previous Button */}
          <button
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
            disabled={currentPage === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/60 text-white rounded-lg disabled:opacity-30 hover:bg-black/80 transition-all pointer-events-auto backdrop-blur-sm"
            style={{ zIndex: 1000 }}
          >
            ← Previous
          </button>

          {/* Next Button */}
          <button
            onClick={() => bookRef.current?.pageFlip().flipNext()}
            disabled={currentPage === pageCount - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/60 text-white rounded-lg disabled:opacity-30 hover:bg-black/80 transition-all pointer-events-auto backdrop-blur-sm"
            style={{ zIndex: 1000 }}
          >
            Next →
          </button>

          {/* Page Number */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white rounded-lg pointer-events-auto backdrop-blur-sm"
            style={{ zIndex: 1000 }}
          >
            Page {currentPage + 1} / {pageCount}
          </div>

          {/* Top Right Buttons */}
          <div
            className="absolute top-4 right-4 flex gap-2 pointer-events-auto"
            style={{ zIndex: 1000 }}
          >
            {/* Download PDF Button */}
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-all backdrop-blur-sm"
            >
              ⬇ Download PDF
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-all backdrop-blur-sm"
            >
              {isFullscreen ? "⤓ Exit" : "⛶ Fullscreen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
