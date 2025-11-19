"use client";

import { useState, useEffect } from "react";
import { FileText, Link as LinkIcon, Check } from "lucide-react";
import { ArrowLeft } from "phosphor-react";
import Link from "next/link";
import Image from "next/image";

interface Certificate {
  filename: string;
  name: string;
  path: string;
  size: number;
  thumbnail: string | null;
}

interface CertificatesData {
  generatedAt: string;
  count: number;
  certificates: Certificate[];
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Enable scrolling for this page
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    fetch("/certificates.json")
      .then((res) => res.json())
      .then((data: CertificatesData) => {
        setCertificates(data.certificates || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading certificates:", err);
        setLoading(false);
      });

    // Cleanup: restore overflow hidden when leaving page
    return () => {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const copyToClipboard = async (certificate: Certificate) => {
    // Encode the path to handle spaces and special characters
    const encodedPath = certificate.path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const url = `${window.location.origin}${encodedPath}`;

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(certificate.filename);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
        return;
      } catch (err) {
        console.error("Failed to copy with Clipboard API:", err);
      }
    }

    // Fallback for older browsers (deprecated but necessary for compatibility)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      // @ts-ignore - execCommand is deprecated but needed for older browser support
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (success) {
        setCopiedId(certificate.filename);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } else {
        console.error("Failed to copy using fallback method");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ overflow: "auto" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4"
      style={{ overflow: "auto", height: "100vh" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex border border-gray-200 rounded-md items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors px-3 py-2 hover:bg-gray-100"
          >
            <ArrowLeft size={20} weight="regular" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Certificates
          </h1>
          <p className="text-gray-600">
            {certificates.length} certificate
            {certificates.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No certificates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.filename}
                className="bg-white rounded-lg border border-gray-200 shadow-md/5 hover:shadow-md transition-shadow p-6 flex flex-col"
              >
                {/* Thumbnail */}
                {certificate.thumbnail ? (
                  <a
                    href={certificate.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-4 relative w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ aspectRatio: "4/3", maxWidth: "300px" }}
                  >
                    <Image
                      src={certificate.thumbnail}
                      alt={certificate.name.replace(/_/g, " ")}
                      width={300}
                      height={212}
                      className="object-contain"
                      unoptimized
                    />
                  </a>
                ) : (
                  <a
                    href={certificate.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-4 w-full bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ aspectRatio: "4/3", maxWidth: "300px" }}
                  >
                    <FileText className="h-12 w-12 text-gray-400" />
                  </a>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-semibold text-gray-900 mb-1"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {certificate.name.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(certificate.size)}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <a
                    href={certificate.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FileText size={18} />
                    View PDF
                  </a>
                  <button
                    onClick={() => copyToClipboard(certificate)}
                    className="px-4 py-2 cursor-pointer bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
                    title="Copy link"
                  >
                    {copiedId === certificate.filename ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <LinkIcon size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
