import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk } from "@next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Header, Footer } from "@/components";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { trackToolUsage } from "@/lib/gtag";
import {
  TOOL_TYPES,
  SIGNATURE_FONTS,
  HIGHLIGHT_COLORS,
  STROKE_COLORS,
  FONT_SIZES,
  STROKE_WIDTHS,
  getInitialsFromName,
  hasColorSupport,
  hasStrokeSupport,
  type ToolType,
} from "@/lib/pdf-signer";

// ============================================================================
// LocalStorage Keys
// ============================================================================

const STORAGE_KEYS = {
  SAVED_SIGNATURES: "pdf-signer-saved-signatures",
  SAVED_FULL_NAME: "pdf-signer-full-name",
} as const;

// ============================================================================
// History Management for Undo/Redo
// ============================================================================

const MAX_HISTORY_SIZE = 50;
import {
  UploadIcon,
  DownloadIcon,
  TrashIcon,
  PencilIcon,
  DocumentTextIcon,
  CheckIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  PlusIcon,
  CalendarIcon,
  PhotographIcon,
  RefreshIcon,
  PencilAltIcon,
  MenuAlt2Icon,
  CheckCircleIcon,
  MinusIcon,
  ArrowRightIcon,
  LockClosedIcon,
  CursorClickIcon,
  DeviceMobileIcon,
  LightningBoltIcon,
  DocumentDuplicateIcon,
  ReplyIcon,
  ShieldCheckIcon,
  SaveIcon,
} from "@heroicons/react/outline";

// ============================================================================
// Constants
// ============================================================================

const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
};

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

// Tool Icon Component
const ToolIcon = ({
  type,
  className = "w-4 h-4",
}: {
  type: string;
  className?: string;
}) => {
  switch (type) {
    case "signature":
      return <PencilAltIcon className={className} />;
    case "fullname":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "initials":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <text
            x="4"
            y="17"
            fontSize="14"
            fontWeight="bold"
            fill="currentColor"
            stroke="none"
          >
            AB
          </text>
        </svg>
      );
    case "text":
      return <MenuAlt2Icon className={className} />;
    case "date":
      return <CalendarIcon className={className} />;
    case "checkbox":
      return <CheckCircleIcon className={className} />;
    case "highlight":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect
            x="3"
            y="8"
            width="18"
            height="8"
            rx="1"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <path d="M3 12h18" strokeLinecap="round" />
        </svg>
      );
    case "circle":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "rectangle":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="5" width="18" height="14" rx="1" />
        </svg>
      );
    case "line":
      return <MinusIcon className={className} />;
    case "arrow":
      return <ArrowRightIcon className={className} />;
    case "strikethrough":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 12h16" strokeLinecap="round" />
          <path d="M7 8l10 8" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      );
    case "image":
      return <PhotographIcon className={className} />;
    default:
      return <PencilIcon className={className} />;
  }
};

// Feature Icon Component for features section
const FeatureIcon = ({
  type,
  className = "w-5 h-5",
}: {
  type: string;
  className?: string;
}) => {
  switch (type) {
    case "signature":
      return <PencilAltIcon className={className} />;
    case "lock":
      return <LockClosedIcon className={className} />;
    case "text":
      return <MenuAlt2Icon className={className} />;
    case "move":
      return <CursorClickIcon className={className} />;
    case "circle":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "image":
      return <PhotographIcon className={className} />;
    case "document":
      return <DocumentDuplicateIcon className={className} />;
    case "device":
      return <DeviceMobileIcon className={className} />;
    case "lightning":
      return <LightningBoltIcon className={className} />;
    default:
      return <CheckIcon className={className} />;
  }
};

// ============================================================================
// Types
// ============================================================================

interface PlacedElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  content: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  strokeWidth?: number;
  rotation?: number;
}

interface SavedSignature {
  id: string;
  type: "draw" | "type" | "image";
  data: string;
  name: string;
  createdAt: number;
}

// History state for undo/redo
interface HistoryState {
  elements: PlacedElement[];
  timestamp: number;
}

// ============================================================================
// Utility Components
// ============================================================================

const Spinner = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============================================================================
// Signature Pad Component
// ============================================================================

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClose: () => void;
}

const SignaturePadModal = ({ onSave, onClose }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].name);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [mode]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    lastPos.current = {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    setHasDrawn(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (mode === "draw" && canvasRef.current) {
      if (!hasDrawn) {
        toast.error("Please draw your signature first");
        return;
      }
      onSave(canvasRef.current.toDataURL("image/png"));
    } else if (mode === "type") {
      if (!typedName.trim()) {
        toast.error("Please enter your name");
        return;
      }
      // Create signature from typed text
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        ctx.font = `48px "${selectedFont}", cursive`;
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, 20, 75);
        onSave(canvas.toDataURL("image/png"));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        onSave(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Signature
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-border">
          {[
            { id: "draw", label: "Draw", icon: "✍️" },
            { id: "type", label: "Type", icon: "⌨️" },
            { id: "upload", label: "Upload", icon: "📷" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as typeof mode)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                mode === tab.id
                  ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {mode === "draw" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Draw your signature below using your mouse, trackpad, or finger
              </p>
              <div className="relative border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={150}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <button
                  onClick={clearCanvas}
                  className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Clear"
                >
                  <RefreshIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {mode === "type" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type your full name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose a style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SIGNATURE_FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => setSelectedFont(font.name)}
                      className={`p-3 border rounded-xl text-left transition-colors ${
                        selectedFont === font.name
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                          : "border-gray-200 dark:border-dark-border hover:border-violet-300"
                      }`}
                    >
                      <span
                        style={{ fontFamily: `"${font.name}", ${font.style}` }}
                        className="text-xl text-gray-900 dark:text-white"
                      >
                        {typedName || "Your Name"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === "upload" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload an image of your signature (PNG, JPG recommended)
              </p>
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl cursor-pointer hover:border-violet-400 transition-colors">
                <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-border/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Create Signature
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Element Toolbar Component
// ============================================================================

interface ElementToolbarProps {
  element: PlacedElement;
  onDelete: () => void;
  onUpdate: (updates: Partial<PlacedElement>) => void;
}

const ElementToolbar = ({
  element,
  onDelete,
  onUpdate,
}: ElementToolbarProps) => {
  const showColorPicker = hasColorSupport(element.type);
  const showStrokeWidth = hasStrokeSupport(element.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute -top-12 left-0 flex items-center gap-1 bg-white dark:bg-dark-card shadow-lg rounded-lg p-1.5 border border-gray-200 dark:border-dark-border z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {element.type === "text" && (
        <select
          value={element.fontSize || 14}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="text-xs p-1 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      )}

      {showColorPicker && (
        <select
          value={
            element.color ||
            (element.type === "highlight"
              ? "rgba(255, 255, 0, 0.4)"
              : "#000000")
          }
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="text-xs p-1 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300"
        >
          {(element.type === "highlight"
            ? HIGHLIGHT_COLORS
            : STROKE_COLORS
          ).map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      )}

      {showStrokeWidth && (
        <select
          value={element.strokeWidth || 2}
          onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
          className="text-xs p-1 border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300"
        >
          {STROKE_WIDTHS.map((width) => (
            <option key={width} value={width}>
              {width}px
            </option>
          ))}
        </select>
      )}

      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
        title="Delete"
      >
        <TrashIcon className="w-4 h-4 text-red-500" />
      </button>
    </motion.div>
  );
};

// ============================================================================
// Resize Handle Component
// ============================================================================

interface ResizeHandleProps {
  position: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";
  onResizeStart: (
    e: React.MouseEvent | React.TouchEvent,
    position: string,
  ) => void;
}

const ResizeHandle = ({ position, onResizeStart }: ResizeHandleProps) => {
  const positionStyles: Record<string, string> = {
    nw: "-top-1.5 -left-1.5 cursor-nw-resize",
    ne: "-top-1.5 -right-1.5 cursor-ne-resize",
    sw: "-bottom-1.5 -left-1.5 cursor-sw-resize",
    se: "-bottom-1.5 -right-1.5 cursor-se-resize",
    n: "-top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize",
    s: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize",
    e: "top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize",
    w: "top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize",
  };

  return (
    <div
      className={`absolute w-3 h-3 bg-white border-2 border-violet-500 rounded-sm hover:bg-violet-100 ${positionStyles[position]}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onResizeStart(e, position);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onResizeStart(e, position);
      }}
    />
  );
};

// ============================================================================
// PDF Viewer Component
// ============================================================================

interface PDFViewerProps {
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  zoom: number;
  elements: PlacedElement[];
  selectedTool: ToolType | null;
  selectedElement: string | null;
  currentSignature: string | null;
  currentImage: string | null;
  fullName: string;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onAddElement: (element: Omit<PlacedElement, "id">) => void;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PlacedElement>) => void;
  onDeleteElement: (id: string) => void;
}

const PDFViewer = ({
  pdfUrl,
  currentPage,
  totalPages,
  zoom,
  elements,
  selectedTool,
  selectedElement,
  currentSignature,
  currentImage,
  fullName,
  onPageChange,
  onZoomChange,
  onAddElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isRendering, setIsRendering] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  // Drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    elementId: string | null;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
  }>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
  });

  // Resize state
  const [resizeState, setResizeState] = useState<{
    isResizing: boolean;
    elementId: string | null;
    handle: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElementX: number;
    startElementY: number;
  }>({
    isResizing: false,
    elementId: null,
    handle: "",
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startElementX: 0,
    startElementY: 0,
  });

  // Load PDF.js dynamically
  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return;

      setIsRendering(true);
      try {
        // @ts-ignore - Dynamic import for pdf.js
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF");
      }
      setIsRendering(false);
    };

    loadPdf();
  }, [pdfUrl]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      setIsRendering(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        setCanvasDimensions({ width: viewport.width, height: viewport.height });

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (error) {
        console.error("Error rendering page:", error);
      }
      setIsRendering(false);
    };

    renderPage();
  }, [pdfDoc, currentPage, zoom]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (dragState.isDragging || resizeState.isResizing) return;
    if (!selectedTool || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let content = "";
    let width = 100;
    let height = 40;
    let color: string | undefined;
    let strokeWidth: number | undefined;

    switch (selectedTool) {
      case "signature":
        if (!currentSignature) {
          toast.error("Please create a signature first");
          return;
        }
        content = currentSignature;
        width = 150;
        height = 60;
        break;
      case "fullname":
        content = fullName || "Full Name";
        width = 180;
        height = 30;
        break;
      case "initials":
        content = getInitialsFromName(fullName);
        width = 60;
        height = 40;
        break;
      case "text":
        content = "Click to edit";
        width = 150;
        height = 30;
        break;
      case "date":
        content = new Date().toLocaleDateString();
        width = 120;
        height = 30;
        break;
      case "checkbox":
        content = "✓";
        width = 24;
        height = 24;
        break;
      case "highlight":
        content = "";
        width = 200;
        height = 20;
        color = "rgba(255, 255, 0, 0.4)";
        break;
      case "circle":
        content = "";
        width = 80;
        height = 80;
        color = "#FF0000";
        strokeWidth = 2;
        break;
      case "rectangle":
        content = "";
        width = 100;
        height = 60;
        color = "#0000FF";
        strokeWidth = 2;
        break;
      case "line":
        content = "";
        width = 150;
        height = 4;
        color = "#000000";
        strokeWidth = 2;
        break;
      case "arrow":
        content = "";
        width = 150;
        height = 20;
        color = "#000000";
        strokeWidth = 2;
        break;
      case "strikethrough":
        content = "";
        width = 150;
        height = 3;
        color = "#FF0000";
        strokeWidth = 2;
        break;
      case "image":
        if (!currentImage) {
          toast.error("Please upload an image first");
          return;
        }
        content = currentImage;
        width = 100;
        height = 100;
        break;
    }

    onAddElement({
      type: selectedTool,
      x,
      y,
      width,
      height,
      page: currentPage,
      content,
      color,
      strokeWidth,
      fontSize: selectedTool === "text" ? 14 : undefined,
    });
  };

  // Drag handlers
  const handleDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    elementId: string,
  ) => {
    e.stopPropagation();
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      isDragging: true,
      elementId,
      startX: clientX,
      startY: clientY,
      elementStartX: element.x,
      elementStartY: element.y,
    });
    onSelectElement(elementId);
  };

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragState.isDragging || !dragState.elementId) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragState.startX;
      const deltaY = clientY - dragState.startY;

      const newX = Math.max(
        0,
        Math.min(canvasDimensions.width - 50, dragState.elementStartX + deltaX),
      );
      const newY = Math.max(
        0,
        Math.min(
          canvasDimensions.height - 50,
          dragState.elementStartY + deltaY,
        ),
      );

      onUpdateElement(dragState.elementId, { x: newX, y: newY });
    },
    [dragState, canvasDimensions, onUpdateElement],
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      elementId: null,
      startX: 0,
      startY: 0,
      elementStartX: 0,
      elementStartY: 0,
    });
  }, []);

  // Resize handlers
  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    elementId: string,
    handle: string,
  ) => {
    e.stopPropagation();
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setResizeState({
      isResizing: true,
      elementId,
      handle,
      startX: clientX,
      startY: clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElementX: element.x,
      startElementY: element.y,
    });
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!resizeState.isResizing || !resizeState.elementId) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - resizeState.startX;
      const deltaY = clientY - resizeState.startY;

      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;
      let newX = resizeState.startElementX;
      let newY = resizeState.startElementY;

      const minSize = 20;

      switch (resizeState.handle) {
        case "se":
          newWidth = Math.max(minSize, resizeState.startWidth + deltaX);
          newHeight = Math.max(minSize, resizeState.startHeight + deltaY);
          break;
        case "sw":
          newWidth = Math.max(minSize, resizeState.startWidth - deltaX);
          newHeight = Math.max(minSize, resizeState.startHeight + deltaY);
          newX =
            resizeState.startElementX + (resizeState.startWidth - newWidth);
          break;
        case "ne":
          newWidth = Math.max(minSize, resizeState.startWidth + deltaX);
          newHeight = Math.max(minSize, resizeState.startHeight - deltaY);
          newY =
            resizeState.startElementY + (resizeState.startHeight - newHeight);
          break;
        case "nw":
          newWidth = Math.max(minSize, resizeState.startWidth - deltaX);
          newHeight = Math.max(minSize, resizeState.startHeight - deltaY);
          newX =
            resizeState.startElementX + (resizeState.startWidth - newWidth);
          newY =
            resizeState.startElementY + (resizeState.startHeight - newHeight);
          break;
        case "e":
          newWidth = Math.max(minSize, resizeState.startWidth + deltaX);
          break;
        case "w":
          newWidth = Math.max(minSize, resizeState.startWidth - deltaX);
          newX =
            resizeState.startElementX + (resizeState.startWidth - newWidth);
          break;
        case "s":
          newHeight = Math.max(minSize, resizeState.startHeight + deltaY);
          break;
        case "n":
          newHeight = Math.max(minSize, resizeState.startHeight - deltaY);
          newY =
            resizeState.startElementY + (resizeState.startHeight - newHeight);
          break;
      }

      onUpdateElement(resizeState.elementId, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    },
    [resizeState, onUpdateElement],
  );

  const handleResizeEnd = useCallback(() => {
    setResizeState({
      isResizing: false,
      elementId: null,
      handle: "",
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startElementX: 0,
      startElementY: 0,
    });
  }, []);

  // Global mouse/touch event listeners for drag and resize
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleDragMove);
      document.addEventListener("touchend", handleDragEnd);
      return () => {
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
        document.removeEventListener("touchmove", handleDragMove);
        document.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (resizeState.isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      document.addEventListener("touchmove", handleResizeMove);
      document.addEventListener("touchend", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
        document.removeEventListener("touchmove", handleResizeMove);
        document.removeEventListener("touchend", handleResizeEnd);
      };
    }
  }, [resizeState.isResizing, handleResizeMove, handleResizeEnd]);

  const pageElements = elements.filter((el) => el.page === currentPage);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-dark-border border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg transition-colors"
          >
            <ZoomOutIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2, zoom + 0.25))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg transition-colors"
          >
            <ZoomInIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-dark-bg p-4">
        <div
          ref={containerRef}
          className="relative mx-auto bg-white shadow-lg"
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
          }}
          onClick={handleCanvasClick}
        >
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Spinner className="w-8 h-8 text-violet-600" />
            </div>
          )}
          <canvas ref={canvasRef} className="block" />

          {/* Placed Elements */}
          {pageElements.map((element) => (
            <div
              key={element.id}
              className={`absolute select-none ${
                selectedElement === element.id
                  ? "ring-2 ring-violet-500 z-20"
                  : "hover:ring-2 hover:ring-violet-300 z-10"
              } ${dragState.isDragging && dragState.elementId === element.id ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
              }}
              onMouseDown={(e) => handleDragStart(e, element.id)}
              onTouchStart={(e) => handleDragStart(e, element.id)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement(element.id);
              }}
            >
              {selectedElement === element.id && (
                <>
                  <ElementToolbar
                    element={element}
                    onDelete={() => onDeleteElement(element.id)}
                    onUpdate={(updates) => onUpdateElement(element.id, updates)}
                  />
                  {/* Resize Handles */}
                  <ResizeHandle
                    position="nw"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                  <ResizeHandle
                    position="ne"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                  <ResizeHandle
                    position="sw"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                  <ResizeHandle
                    position="se"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                  <ResizeHandle
                    position="n"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                  <ResizeHandle
                    position="s"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                  <ResizeHandle
                    position="e"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                  <ResizeHandle
                    position="w"
                    onResizeStart={(e, pos) =>
                      handleResizeStart(e, element.id, pos)
                    }
                  />
                </>
              )}

              {element.type === "signature" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={element.content}
                  alt="Signature"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
              )}

              {element.type === "initials" && (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-900 pointer-events-none">
                  {element.content}
                </div>
              )}

              {element.type === "fullname" && (
                <div
                  className="w-full h-full flex items-center px-2 text-gray-900 font-medium pointer-events-none"
                  style={{ fontSize: element.fontSize || 14 }}
                >
                  {element.content}
                </div>
              )}

              {element.type === "text" && (
                <input
                  type="text"
                  value={element.content}
                  onChange={(e) =>
                    onUpdateElement(element.id, { content: e.target.value })
                  }
                  className="w-full h-full px-2 text-gray-900 bg-transparent border-none focus:outline-none"
                  style={{ fontSize: element.fontSize || 14 }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              )}

              {element.type === "date" && (
                <div
                  className="w-full h-full flex items-center px-2 text-gray-900 pointer-events-none"
                  style={{ fontSize: element.fontSize || 14 }}
                >
                  {element.content}
                </div>
              )}

              {element.type === "checkbox" && (
                <div className="w-full h-full flex items-center justify-center text-lg text-green-600 font-bold border-2 border-gray-400 rounded pointer-events-none">
                  {element.content}
                </div>
              )}

              {element.type === "highlight" && (
                <div
                  className="w-full h-full pointer-events-none"
                  style={{
                    backgroundColor: element.color || "rgba(255, 255, 0, 0.4)",
                  }}
                />
              )}

              {element.type === "circle" && (
                <div
                  className="w-full h-full rounded-full pointer-events-none"
                  style={{
                    border: `${element.strokeWidth || 2}px solid ${element.color || "#FF0000"}`,
                  }}
                />
              )}

              {element.type === "rectangle" && (
                <div
                  className="w-full h-full pointer-events-none"
                  style={{
                    border: `${element.strokeWidth || 2}px solid ${element.color || "#0000FF"}`,
                  }}
                />
              )}

              {element.type === "line" && (
                <div
                  className="w-full pointer-events-none"
                  style={{
                    height: element.strokeWidth || 2,
                    backgroundColor: element.color || "#000000",
                    marginTop:
                      (element.height - (element.strokeWidth || 2)) / 2,
                  }}
                />
              )}

              {element.type === "arrow" && (
                <svg
                  className="w-full h-full pointer-events-none"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker
                      id={`arrowhead-${element.id}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={element.color || "#000000"}
                      />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1="10"
                    x2="90"
                    y2="10"
                    stroke={element.color || "#000000"}
                    strokeWidth={element.strokeWidth || 2}
                    markerEnd={`url(#arrowhead-${element.id})`}
                  />
                </svg>
              )}

              {element.type === "strikethrough" && (
                <div
                  className="w-full pointer-events-none"
                  style={{
                    height: element.strokeWidth || 2,
                    backgroundColor: element.color || "#FF0000",
                    marginTop:
                      (element.height - (element.strokeWidth || 2)) / 2,
                  }}
                />
              )}

              {element.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={element.content}
                  alt="Image"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function PDFSigner() {
  const router = useRouter();
  const { locale: currentLocale, defaultLocale, locales } = router;
  const { t } = useTranslation();

  // State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<PlacedElement[]>([]);
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Undo/Redo history state
  const [history, setHistory] = useState<HistoryState[]>([
    { elements: [], timestamp: Date.now() },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Saved signatures from localStorage
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load saved signatures
      const savedSigs = localStorage.getItem(STORAGE_KEYS.SAVED_SIGNATURES);
      if (savedSigs) {
        try {
          setSavedSignatures(JSON.parse(savedSigs));
        } catch (e) {
          console.error("Failed to load saved signatures:", e);
        }
      }

      // Load saved full name
      const savedName = localStorage.getItem(STORAGE_KEYS.SAVED_FULL_NAME);
      if (savedName) {
        setFullName(savedName);
      }
    }
  }, []);

  // Save full name to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && fullName) {
      localStorage.setItem(STORAGE_KEYS.SAVED_FULL_NAME, fullName);
    }
  }, [fullName]);

  // Track element changes for undo/redo (skip if undo/redo action)
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    // Only add to history if elements actually changed
    const currentState = history[historyIndex];
    if (JSON.stringify(currentState.elements) === JSON.stringify(elements)) {
      return;
    }

    // Remove any future history when new changes are made
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: [...elements], timestamp: Date.now() });

    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex].elements]);
      setSelectedElement(null);
      toast.success("Undo", { duration: 1000, icon: "↩️" });
    }
  }, [historyIndex, history]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex].elements]);
      setSelectedElement(null);
      toast.success("Redo", { duration: 1000, icon: "↪️" });
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement)?.isContentEditable;

      // Allow Escape even in inputs
      if (e.key === "Escape") {
        setSelectedElement(null);
        setSelectedTool(null);
        return;
      }

      // Skip other shortcuts when typing
      if (isInputActive) return;

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Delete selected element: Delete or Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElement) {
        e.preventDefault();
        handleDeleteElement(selectedElement);
        return;
      }

      // Arrow keys for precise positioning
      if (
        selectedElement &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const moveAmount = e.shiftKey ? 10 : 1;
        const updates: Partial<PlacedElement> = {};

        switch (e.key) {
          case "ArrowUp":
            updates.y =
              elements.find((el) => el.id === selectedElement)!.y - moveAmount;
            break;
          case "ArrowDown":
            updates.y =
              elements.find((el) => el.id === selectedElement)!.y + moveAmount;
            break;
          case "ArrowLeft":
            updates.x =
              elements.find((el) => el.id === selectedElement)!.x - moveAmount;
            break;
          case "ArrowRight":
            updates.x =
              elements.find((el) => el.id === selectedElement)!.x + moveAmount;
            break;
        }

        handleUpdateElement(selectedElement, updates);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement, elements, handleUndo, handleRedo]);

  // Save signature to localStorage
  const saveSignatureToStorage = useCallback(
    (signature: string, name: string = "My Signature") => {
      const newSig: SavedSignature = {
        id: `sig-${Date.now()}`,
        type: "draw",
        data: signature,
        name,
        createdAt: Date.now(),
      };

      const updated = [...savedSignatures, newSig];
      setSavedSignatures(updated);
      localStorage.setItem(
        STORAGE_KEYS.SAVED_SIGNATURES,
        JSON.stringify(updated),
      );
      toast.success("Signature saved for future use!");
    },
    [savedSignatures],
  );

  // Delete saved signature
  const deleteSavedSignature = useCallback(
    (id: string) => {
      const updated = savedSignatures.filter((s) => s.id !== id);
      setSavedSignatures(updated);
      localStorage.setItem(
        STORAGE_KEYS.SAVED_SIGNATURES,
        JSON.stringify(updated),
      );
      toast.success("Signature deleted");
    },
    [savedSignatures],
  );

  // Select and use a saved signature
  const selectSavedSignature = useCallback((signature: SavedSignature) => {
    setCurrentSignature(signature.data);
    setSelectedTool("signature");
    toast.success("Signature selected! Click on PDF to place it.");
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be under 50MB");
      return;
    }

    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setCurrentPage(1);
    setElements([]);
    setSelectedElement(null);

    // Get total pages
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
      toast.success(
        `PDF loaded: ${pdf.numPages} page${pdf.numPages > 1 ? "s" : ""}`,
      );
      trackToolUsage("pdf_signer", "upload");
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF");
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragging to false if leaving the actual container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // Handle image upload for stamp
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setCurrentImage(result);
        setSelectedTool("image");
        toast.success("Image loaded! Click on PDF to place it.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Add element
  const handleAddElement = (element: Omit<PlacedElement, "id">) => {
    const newElement: PlacedElement = {
      ...element,
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  // Update element
  const handleUpdateElement = (id: string, updates: Partial<PlacedElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  // Download signed PDF
  const handleDownload = async () => {
    if (!pdfFile || elements.length === 0) {
      toast.error("Please add at least one element to the PDF");
      return;
    }

    setIsProcessing(true);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");

      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      // Helper to parse color
      const parseColor = (color: string) => {
        if (color.startsWith("rgba")) {
          const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            return rgb(
              parseInt(match[1]) / 255,
              parseInt(match[2]) / 255,
              parseInt(match[3]) / 255,
            );
          }
        } else if (color.startsWith("#")) {
          const hex = color.slice(1);
          return rgb(
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255,
          );
        }
        return rgb(0, 0, 0);
      };

      for (const element of elements) {
        const page = pages[element.page - 1];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();
        const scaleX = pageWidth / (pageWidth * zoom);
        const scaleY = pageHeight / (pageHeight * zoom);

        const x = element.x * scaleX;
        const y = pageHeight - (element.y + element.height) * scaleY;
        const width = element.width * scaleX;
        const height = element.height * scaleY;

        if (
          (element.type === "signature" || element.type === "image") &&
          element.content.startsWith("data:")
        ) {
          const imageBytes = await fetch(element.content).then((r) =>
            r.arrayBuffer(),
          );
          const isPng = element.content.includes("image/png");
          const image = isPng
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);
          page.drawImage(image, {
            x,
            y,
            width,
            height,
          });
        } else if (element.type === "text" || element.type === "date") {
          page.drawText(element.content, {
            x,
            y: y + height * 0.3,
            size: (element.fontSize || 14) * scaleX,
            color: rgb(0, 0, 0),
          });
        } else if (element.type === "checkbox") {
          page.drawText("✓", {
            x: x + 4,
            y: y + 4,
            size: 16 * scaleX,
            color: rgb(0, 0.5, 0),
          });
        } else if (element.type === "highlight") {
          page.drawRectangle({
            x,
            y,
            width,
            height,
            color: parseColor(element.color || "rgba(255, 255, 0, 0.4)"),
            opacity: 0.4,
          });
        } else if (element.type === "circle") {
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const radiusX = width / 2;
          const radiusY = height / 2;
          page.drawEllipse({
            x: centerX,
            y: centerY,
            xScale: radiusX,
            yScale: radiusY,
            borderColor: parseColor(element.color || "#FF0000"),
            borderWidth: element.strokeWidth || 2,
          });
        } else if (element.type === "rectangle") {
          page.drawRectangle({
            x,
            y,
            width,
            height,
            borderColor: parseColor(element.color || "#0000FF"),
            borderWidth: element.strokeWidth || 2,
          });
        } else if (
          element.type === "line" ||
          element.type === "strikethrough"
        ) {
          page.drawLine({
            start: { x, y: y + height / 2 },
            end: { x: x + width, y: y + height / 2 },
            color: parseColor(element.color || "#000000"),
            thickness: element.strokeWidth || 2,
          });
        } else if (element.type === "arrow") {
          // Draw line
          page.drawLine({
            start: { x, y: y + height / 2 },
            end: { x: x + width - 10, y: y + height / 2 },
            color: parseColor(element.color || "#000000"),
            thickness: element.strokeWidth || 2,
          });
          // Draw arrowhead (triangle)
          const arrowSize = 10;
          const endX = x + width;
          const endY = y + height / 2;
          page.drawLine({
            start: { x: endX - arrowSize, y: endY + arrowSize / 2 },
            end: { x: endX, y: endY },
            color: parseColor(element.color || "#000000"),
            thickness: element.strokeWidth || 2,
          });
          page.drawLine({
            start: { x: endX - arrowSize, y: endY - arrowSize / 2 },
            end: { x: endX, y: endY },
            color: parseColor(element.color || "#000000"),
            thickness: element.strokeWidth || 2,
          });
        } else if (element.type === "initials") {
          page.drawText(element.content, {
            x: x + 5,
            y: y + height * 0.3,
            size: 24 * scaleX,
            color: rgb(0, 0, 0),
          });
        } else if (element.type === "fullname") {
          page.drawText(element.content, {
            x: x + 5,
            y: y + height * 0.3,
            size: (element.fontSize || 14) * scaleX,
            color: rgb(0, 0, 0),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed_${pdfFile.name}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
      trackToolUsage("pdf_signer", "download");
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("Failed to save PDF");
    }
    setIsProcessing(false);
  };

  // Clear all
  const handleClear = () => {
    setPdfFile(null);
    setPdfUrl("");
    setElements([]);
    setSelectedElement(null);
    setCurrentPage(1);
    setTotalPages(0);
    // Reset history
    setHistory([{ elements: [], timestamp: Date.now() }]);
    setHistoryIndex(0);
  };

  // SEO
  const pageUrl =
    currentLocale === defaultLocale
      ? `${SITE_URL}/tools/pdf-signer`
      : `${SITE_URL}/${currentLocale}/tools/pdf-signer`;
  const ogLocale = LOCALE_MAP[currentLocale || "en"] || "en_US";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-dark-bg dark:to-darkOffset">
      <Head>
        <title>{t("tools.pdfSigner.pageTitle")}</title>
        <meta
          name="description"
          content={t("tools.pdfSigner.pageDescription")}
        />
        <meta
          name="keywords"
          content="pdf signer, sign pdf online, fill pdf, esign document, electronic signature, free pdf signature, pdf form filler, add signature to pdf, sign documents online, digital signature"
        />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:title" content={t("tools.pdfSigner.pageTitle")} />
        <meta
          property="og:description"
          content={t("tools.pdfSigner.pageDescription")}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={ogLocale} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("tools.pdfSigner.pageTitle")} />
        <meta
          name="twitter:description"
          content={t("tools.pdfSigner.pageDescription")}
        />

        {locales?.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={
              locale === defaultLocale
                ? `${SITE_URL}/tools/pdf-signer`
                : `${SITE_URL}/${locale}/tools/pdf-signer`
            }
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />

        {/* Schema.org WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: t("tools.pdfSigner.name"),
              description: t("tools.pdfSigner.pageDescription"),
              url: pageUrl,
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Draw, type, or upload signatures",
                "Drag and drop elements anywhere",
                "Resize signatures and elements",
                "Fill PDF form fields",
                "Add text anywhere on PDF",
                "Insert dates automatically",
                "Add checkmarks and annotations",
                "Highlight important sections",
                "Draw circles and rectangles",
                "Add lines and arrows",
                "Strikethrough text",
                "Upload custom images and stamps",
                "Multi-page PDF support",
                "100% client-side processing",
                "No file uploads to server",
                "Download signed PDF instantly",
                "Mobile-friendly interface",
                "Dark mode support",
              ],
            }),
          }}
        />

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is this PDF signer free to use?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, this PDF signer is completely free with no limits. Sign and fill unlimited PDFs without signing up or paying anything. There are no watermarks added to your documents.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my PDF secure? Do you store my files?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Your files are 100% secure. All PDF processing happens directly in your browser - your documents are never uploaded to our servers. This makes it safe for signing contracts, tax forms, and confidential documents.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I create a signature?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You have three options: draw your signature using your mouse, trackpad, or finger; type your name and choose from handwriting fonts; or upload an image of your existing signature.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I sign multiple pages?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Navigate through all pages of your PDF using the page controls. You can add signatures, text, dates, and other elements to any page in your document.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Are electronic signatures legally binding?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "In most countries, electronic signatures are legally recognized for most documents under laws like the ESIGN Act (US) and eIDAS (EU). However, certain documents may require notarization or wet signatures.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What can I add to my PDF?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can add signatures, initials, text fields, dates, checkmarks, and highlights. All elements can be positioned anywhere on the document and resized as needed.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the maximum file size?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can upload PDFs up to 50MB in size. Since processing happens in your browser, larger files may take longer to load depending on your device.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does this work on mobile devices?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, our PDF signer is fully responsive and works on smartphones and tablets. You can draw signatures using your finger on touch devices.",
                  },
                },
              ],
            }),
          }}
        />

        {/* HowTo Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: "How to Sign a PDF Online",
              description:
                "Learn how to fill and sign PDF documents using our free online tool.",
              step: [
                {
                  "@type": "HowToStep",
                  name: "Upload your PDF",
                  text: "Drag and drop your PDF file or click to browse. Files up to 50MB are supported.",
                  position: 1,
                },
                {
                  "@type": "HowToStep",
                  name: "Create your signature",
                  text: "Click the signature tool and draw, type, or upload your signature. You can also add initials.",
                  position: 2,
                },
                {
                  "@type": "HowToStep",
                  name: "Place elements on the PDF",
                  text: "Select a tool (signature, text, date, checkbox) and click anywhere on the document to place it. Resize and reposition as needed.",
                  position: 3,
                },
                {
                  "@type": "HowToStep",
                  name: "Download signed PDF",
                  text: "Click the download button to save your signed PDF. The file is processed locally and downloads instantly.",
                  position: 4,
                },
              ],
            }),
          }}
        />
      </Head>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Header />

      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="w-full max-w-6xl mb-4">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/tools"
                className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Tools
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              PDF Signer
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8 w-full max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium mb-4">
            <PencilIcon className="w-3.5 h-3.5" />
            {t("tools.pdfSigner.badge")}
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 ${spaceGrotesk.className}`}
          >
            {t("tools.pdfSigner.h1Title")}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("tools.pdfSigner.subtitle")}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-6xl">
          {/* Privacy Badge - Always visible */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 flex items-center justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
              <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                100% Private — Files never leave your device
              </span>
            </div>
          </motion.div>

          {!pdfFile ? (
            /* Upload Area */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragging
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                  : "border-gray-300 dark:border-dark-border hover:border-violet-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t("tools.pdfSigner.uploadTitle")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {t("tools.pdfSigner.uploadSubtitle")}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
                >
                  {t("tools.pdfSigner.selectFile")}
                </button>
                <p className="text-sm text-gray-400 mt-4">
                  {t("tools.pdfSigner.maxSize")}
                </p>
              </div>
            </motion.div>
          ) : (
            /* Editor */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col lg:flex-row gap-4"
            >
              {/* Left Sidebar - Tools */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {t("tools.pdfSigner.toolsTitle")}
                  </h3>

                  {/* Signature Section */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowSignaturePad(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      {currentSignature
                        ? "Change Signature"
                        : "Create Signature"}
                    </button>
                    {currentSignature && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-dark-border rounded-lg relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentSignature}
                          alt="Your signature"
                          className="max-h-12 mx-auto"
                        />
                        {/* Save button - appears on hover */}
                        {!savedSignatures.some(
                          (s) => s.data === currentSignature,
                        ) && (
                          <button
                            onClick={() =>
                              saveSignatureToStorage(currentSignature)
                            }
                            className="absolute top-1 right-1 p-1 bg-white dark:bg-dark-card rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Save for later"
                          >
                            <SaveIcon className="w-4 h-4 text-violet-600" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Saved Signatures */}
                  {savedSignatures.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        Saved Signatures
                      </label>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {savedSignatures.map((sig) => (
                          <div
                            key={sig.id}
                            className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-dark-border rounded-lg group cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-card"
                            onClick={() => selectSavedSignature(sig)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sig.data}
                              alt={sig.name}
                              className="h-6 flex-1 object-contain"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSavedSignature(sig.id);
                              }}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete"
                            >
                              <XIcon className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Name Input */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    {fullName && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Initials:{" "}
                        <span className="font-semibold">
                          {getInitialsFromName(fullName)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Image Upload for stamp */}
                  <div className="mb-4">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full flex items-center gap-3 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors border border-violet-200 dark:border-violet-800"
                    >
                      <PhotographIcon className="w-4 h-4" />
                      {currentImage ? "Change Image" : "Upload Image"}
                    </button>
                    {currentImage && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-dark-border rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentImage}
                          alt="Your image"
                          className="max-h-12 mx-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tool Buttons */}
                  <div className="space-y-1">
                    {TOOL_TYPES.filter((t) => t.id !== "image").map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (tool.id === "signature" && !currentSignature) {
                            setShowSignaturePad(true);
                            return;
                          }
                          setSelectedTool(
                            selectedTool === tool.id ? null : tool.id,
                          );
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedTool === tool.id
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                            : "hover:bg-gray-100 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <ToolIcon type={tool.iconType} className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {tool.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border space-y-2">
                    {/* Undo/Redo Buttons */}
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Undo (Ctrl+Z)"
                      >
                        <ReplyIcon className="w-4 h-4" />
                        <span className="text-xs">Undo</span>
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Redo (Ctrl+Y)"
                      >
                        <ReplyIcon className="w-4 h-4 transform scale-x-[-1]" />
                        <span className="text-xs">Redo</span>
                      </button>
                    </div>
                    <button
                      onClick={handleDownload}
                      disabled={isProcessing || elements.length === 0}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <DownloadIcon className="w-4 h-4" />
                      )}
                      {t("tools.pdfSigner.download")}
                    </button>
                    <button
                      onClick={handleClear}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      {t("tools.pdfSigner.clearAll")}
                    </button>
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-dark-border">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Shortcuts:</span> Del to
                      delete, Arrow keys to move, Esc to deselect
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden min-h-[600px]">
                <PDFViewer
                  pdfUrl={pdfUrl}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  zoom={zoom}
                  elements={elements}
                  selectedTool={selectedTool}
                  selectedElement={selectedElement}
                  currentSignature={currentSignature}
                  currentImage={currentImage}
                  fullName={fullName}
                  onPageChange={setCurrentPage}
                  onZoomChange={setZoom}
                  onAddElement={handleAddElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                />
              </div>
            </motion.div>
          )}

          {/* Features Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("tools.pdfSigner.featuresTitle")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("tools.pdfSigner.featuresDescription")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  iconType: "signature",
                  title: "Multiple Signature Options",
                  desc: "Draw, type, or upload your signature. Save for reuse.",
                },
                {
                  iconType: "lock",
                  title: "100% Private & Secure",
                  desc: "Files never leave your browser. No server uploads.",
                },
                {
                  iconType: "text",
                  title: "Fill Form Fields",
                  desc: "Add text, dates, and checkmarks anywhere.",
                },
                {
                  iconType: "move",
                  title: "Drag & Resize Elements",
                  desc: "Move and resize any element with ease. Full control.",
                },
                {
                  iconType: "circle",
                  title: "Shapes & Annotations",
                  desc: "Add circles, rectangles, lines, arrows, and highlights.",
                },
                {
                  iconType: "image",
                  title: "Image Stamps",
                  desc: "Upload and place custom images or logos.",
                },
                {
                  iconType: "document",
                  title: "Multi-page Support",
                  desc: "Navigate and sign any page in your PDF.",
                },
                {
                  iconType: "lightning",
                  title: "Undo & Redo",
                  desc: "Made a mistake? Ctrl+Z to undo, Ctrl+Y to redo.",
                },
                {
                  iconType: "device",
                  title: "Keyboard Shortcuts",
                  desc: "Delete, arrow keys, and more for power users.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border"
                >
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-3">
                    <FeatureIcon
                      type={feature.iconType}
                      className="w-5 h-5 text-violet-600 dark:text-violet-400"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 sm:mt-16"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 max-w-3xl mx-auto">
              {[
                {
                  q: "Is this PDF signer free to use?",
                  a: "Yes, this PDF signer is completely free with no limits. Sign and fill unlimited PDFs without signing up or paying anything. There are no watermarks added to your documents.",
                },
                {
                  q: "Is my PDF secure? Do you store my files?",
                  a: "Your files are 100% secure. All PDF processing happens directly in your browser - your documents are never uploaded to our servers. This makes it safe for signing contracts, tax forms, and confidential documents.",
                },
                {
                  q: "How do I create a signature?",
                  a: "You have three options: draw your signature using your mouse, trackpad, or finger; type your name and choose from handwriting fonts; or upload an image of your existing signature.",
                },
                {
                  q: "Can I resize my signature?",
                  a: "Absolutely! Click on any element to select it, then use the resize handles on the corners and edges to make it larger or smaller. You can also drag elements to reposition them anywhere on the page.",
                },
                {
                  q: "Can I sign multiple pages?",
                  a: "Yes! Navigate through all pages of your PDF using the page controls. You can add signatures, text, dates, and other elements to any page in your document.",
                },
                {
                  q: "Are electronic signatures legally binding?",
                  a: "In most countries, electronic signatures are legally recognized for most documents under laws like the ESIGN Act (US) and eIDAS (EU). However, certain documents may require notarization.",
                },
                {
                  q: "What can I add to my PDF?",
                  a: "You can add signatures, initials, text fields, dates, checkmarks, highlights, circles, rectangles, lines, arrows, strikethroughs, and custom images. All elements can be positioned and resized anywhere on the document.",
                },
                {
                  q: "Can I add shapes and annotations?",
                  a: "Yes! Use the circle, rectangle, line, and arrow tools to mark up your PDF. You can change colors and stroke width for each shape. Perfect for reviewing documents or drawing attention to specific areas.",
                },
                {
                  q: "Can I add my company logo or stamp?",
                  a: "Yes, use the 'Upload Image' button to add any image, including company logos, stamps, or watermarks. You can resize and position the image anywhere on your PDF.",
                },
                {
                  q: "What is the maximum file size?",
                  a: "You can upload PDFs up to 50MB in size. Since processing happens in your browser, larger files may take longer to load depending on your device.",
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                    <span className="font-medium text-gray-900 dark:text-white pr-4">
                      {faq.q}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />

      {/* Signature Pad Modal */}
      <AnimatePresence>
        {showSignaturePad && (
          <SignaturePadModal
            onSave={(signature) => {
              setCurrentSignature(signature);
              setShowSignaturePad(false);
              setSelectedTool("signature");
              toast.success("Signature created!");
            }}
            onClose={() => setShowSignaturePad(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
