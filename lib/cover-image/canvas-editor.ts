// ============================================================================
// Cover Image Generator - Interactive Canvas Editor
// Uses Fabric.js for drag & drop, resize, and direct editing
// ============================================================================

import { useEffect, useRef, useCallback, useState } from "react";
import type { fabric as FabricTypes } from "fabric";
import type {
  CanvasElement,
  TextElement,
  ShapeElement,
  BadgeElement,
  EmojiElement,
  ImageElement,
  HistoryState,
  BackgroundSettings,
} from "@/lib/cover-image/editor-types";
import {
  DEFAULT_IMAGE_FILTERS,
  generateElementId,
} from "@/lib/cover-image/editor-types";
import type { CoverSettings } from "@/lib/cover-image/constants";
import { getGradientCSS } from "@/lib/cover-image/canvas";

// Fabric.js types
type FabricCanvas = FabricTypes.Canvas;
type FabricObject = FabricTypes.Object;
type FabricImage = FabricTypes.Image;
type IEvent = FabricTypes.IEvent<MouseEvent>;

// Dynamic import for Fabric.js (client-side only)
let fabric: typeof import("fabric").fabric | null = null;
if (typeof window !== "undefined") {
  import("fabric").then((mod) => {
    fabric = mod.fabric;
  });
}

interface UseCanvasEditorProps {
  settings: CoverSettings;
  width: number;
  height: number;
  backgroundSettings: BackgroundSettings;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (element: CanvasElement) => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
}

interface CanvasEditorReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isReady: boolean;
  selectedElementId: string | null;

  // Element operations
  addTextElement: (text?: string) => void;
  addShapeElement: (shapeType: ShapeElement["shapeType"]) => void;
  addBadgeElement: (text: string, bgColor: string, textColor: string) => void;
  addEmojiElement: (emoji: string) => void;
  addImageElement: (src: string) => void;

  // Selection operations
  deleteSelected: () => void;
  duplicateSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;

  // History operations
  undo: () => void;
  redo: () => void;

  // Export
  exportToDataURL: () => string | null;
  exportToPNG: () => void;
}

export function useCanvasEditor({
  settings,
  width,
  height,
  backgroundSettings,
  onElementSelect,
  onElementUpdate,
  onHistoryChange,
}: UseCanvasEditorProps): CanvasEditorReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );

  // History management
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || !fabric) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Selection event handlers
    canvas.on("selection:created", (e: IEvent) => {
      const selected = (e as any).selected?.[0];
      if (selected) {
        const elementId = (selected as any).elementId;
        setSelectedElementId(elementId);
        onElementSelect(elementId);
      }
    });

    canvas.on("selection:updated", (e: IEvent) => {
      const selected = (e as any).selected?.[0];
      if (selected) {
        const elementId = (selected as any).elementId;
        setSelectedElementId(elementId);
        onElementSelect(elementId);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedElementId(null);
      onElementSelect(null);
    });

    // Object modification handlers
    canvas.on("object:modified", (e: IEvent) => {
      if (!isUndoRedoRef.current) {
        saveToHistory();
      }
      const obj = e.target;
      if (obj) {
        const elementId = (obj as any).elementId;
        // Could update element state here
      }
    });

    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update canvas size when dimensions change
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.setDimensions({ width, height });
    fabricCanvasRef.current.renderAll();
  }, [width, height]);

  // Draw background
  useEffect(() => {
    if (!fabricCanvasRef.current || !fabric) return;

    const canvas = fabricCanvasRef.current;

    // Clear existing background
    canvas.setBackgroundImage(null as any, canvas.renderAll.bind(canvas));

    if (backgroundSettings.type === "image" && backgroundSettings.image) {
      fabric.Image.fromURL(
        backgroundSettings.image,
        (img: FabricImage | null) => {
          if (!img || !fabricCanvasRef.current || !fabric) return;

          // Apply filters
          const { brightness, contrast, saturation, blur, grayscale } =
            backgroundSettings.imageFilters;

          img.filters = [];
          if (brightness !== 100) {
            img.filters.push(
              new fabric.Image.filters.Brightness({
                brightness: (brightness - 100) / 100,
              }),
            );
          }
          if (contrast !== 100) {
            img.filters.push(
              new fabric.Image.filters.Contrast({
                contrast: (contrast - 100) / 100,
              }),
            );
          }
          if (saturation !== 100) {
            img.filters.push(
              new fabric.Image.filters.Saturation({
                saturation: (saturation - 100) / 100,
              }),
            );
          }
          if (grayscale > 0) {
            img.filters.push(new fabric.Image.filters.Grayscale());
          }
          if (blur > 0) {
            img.filters.push(
              new fabric.Image.filters.Blur({ blur: blur / 100 }),
            );
          }

          img.applyFilters();

          // Scale to cover
          const scaleX = width / (img.width || 1);
          const scaleY = height / (img.height || 1);
          const scale = Math.max(scaleX, scaleY);

          img.set({
            scaleX: scale,
            scaleY: scale,
            originX: "center",
            originY: "center",
            left: width / 2,
            top: height / 2,
          });

          fabricCanvasRef.current?.setBackgroundImage(img, () => {
            // Add overlay if enabled
            if (backgroundSettings.overlay.enabled && fabric) {
              const overlay = new fabric.Rect({
                left: 0,
                top: 0,
                width,
                height,
                fill: backgroundSettings.overlay.color,
                opacity: backgroundSettings.overlay.opacity,
                selectable: false,
                evented: false,
              });
              (overlay as any).isOverlay = true;
              fabricCanvasRef.current?.add(overlay);
              fabricCanvasRef.current?.sendToBack(overlay);
            }
            fabricCanvasRef.current?.renderAll();
          });
        },
        { crossOrigin: "anonymous" },
      );
    } else {
      // Use gradient background (rendered separately in preview)
      canvas.renderAll();
    }
  }, [backgroundSettings, width, height]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const state: HistoryState = {
      elements: [], // Would serialize canvas objects
      backgroundImage: backgroundSettings.image,
      timestamp: Date.now(),
    };

    // Trim future history if we're not at the end
    historyRef.current = historyRef.current.slice(
      0,
      historyIndexRef.current + 1,
    );
    historyRef.current.push(state);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history size
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }

    onHistoryChange(historyIndexRef.current > 0, false);
  }, [backgroundSettings.image, onHistoryChange]);

  // Add text element
  const addTextElement = useCallback(
    (text: string = "New Text") => {
      if (!fabricCanvasRef.current || !fabric) return;

      const elementId = generateElementId();
      const textObj = new fabric.IText(text, {
        left: width / 2,
        top: height / 2,
        fontSize: 48,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: "700",
        fill: settings.textColor,
        textAlign: "center",
        originX: "center",
        originY: "center",
        editable: true,
      });

      (textObj as any).elementId = elementId;
      (textObj as any).elementType = "text";

      fabricCanvasRef.current.add(textObj);
      fabricCanvasRef.current.setActiveObject(textObj);
      fabricCanvasRef.current.renderAll();

      saveToHistory();
    },
    [width, height, settings.textColor, saveToHistory],
  );

  // Add shape element
  const addShapeElement = useCallback(
    (shapeType: ShapeElement["shapeType"]) => {
      if (!fabricCanvasRef.current || !fabric) return;

      const elementId = generateElementId();
      let shape: FabricObject;

      const commonProps = {
        left: width / 2,
        top: height / 2,
        fill: "rgba(255, 255, 255, 0.2)",
        stroke: "rgba(255, 255, 255, 0.5)",
        strokeWidth: 2,
        originX: "center" as const,
        originY: "center" as const,
      };

      switch (shapeType) {
        case "circle":
          shape = new fabric.Circle({
            ...commonProps,
            radius: 50,
          });
          break;
        case "triangle":
          shape = new fabric.Triangle({
            ...commonProps,
            width: 100,
            height: 100,
          });
          break;
        case "star":
          // Create star using polygon
          const points = createStarPoints(5, 50, 25);
          shape = new fabric.Polygon(points, {
            ...commonProps,
          });
          break;
        case "hexagon":
          const hexPoints = createPolygonPoints(6, 50);
          shape = new fabric.Polygon(hexPoints, {
            ...commonProps,
          });
          break;
        case "line":
          shape = new fabric.Line([0, 0, 100, 0], {
            ...commonProps,
            fill: undefined,
            strokeWidth: 3,
          });
          break;
        default:
          shape = new fabric.Rect({
            ...commonProps,
            width: 100,
            height: 100,
            rx: 8,
            ry: 8,
          });
      }

      (shape as any).elementId = elementId;
      (shape as any).elementType = "shape";

      fabricCanvasRef.current.add(shape);
      fabricCanvasRef.current.setActiveObject(shape);
      fabricCanvasRef.current.renderAll();

      saveToHistory();
    },
    [width, height, saveToHistory],
  );

  // Add badge element
  const addBadgeElement = useCallback(
    (text: string, bgColor: string, textColor: string) => {
      if (!fabricCanvasRef.current || !fabric) return;

      const elementId = generateElementId();
      const padding = 12;
      const fontSize = 14;

      // Create text first to measure
      const textObj = new fabric.Text(text, {
        fontSize,
        fontFamily: "'Inter', sans-serif",
        fontWeight: "700",
        fill: textColor,
      });

      const textWidth = textObj.width || 50;
      const textHeight = textObj.height || 20;

      // Create background rect
      const rect = new fabric.Rect({
        width: textWidth + padding * 2,
        height: textHeight + padding,
        fill: bgColor,
        rx: 6,
        ry: 6,
      });

      // Group them
      const badge = new fabric.Group([rect, textObj], {
        left: 50,
        top: 50,
      });

      // Center text in rect
      textObj.set({
        left: -textWidth / 2,
        top: -textHeight / 2,
      });

      (badge as any).elementId = elementId;
      (badge as any).elementType = "badge";

      fabricCanvasRef.current.add(badge);
      fabricCanvasRef.current.setActiveObject(badge);
      fabricCanvasRef.current.renderAll();

      saveToHistory();
    },
    [saveToHistory],
  );

  // Add emoji element
  const addEmojiElement = useCallback(
    (emoji: string) => {
      if (!fabricCanvasRef.current || !fabric) return;

      const elementId = generateElementId();
      const emojiObj = new fabric.Text(emoji, {
        left: width / 2,
        top: height / 2,
        fontSize: 64,
        originX: "center",
        originY: "center",
      });

      (emojiObj as any).elementId = elementId;
      (emojiObj as any).elementType = "emoji";

      fabricCanvasRef.current.add(emojiObj);
      fabricCanvasRef.current.setActiveObject(emojiObj);
      fabricCanvasRef.current.renderAll();

      saveToHistory();
    },
    [width, height, saveToHistory],
  );

  // Add image element
  const addImageElement = useCallback(
    (src: string) => {
      if (!fabricCanvasRef.current || !fabric) return;

      const elementId = generateElementId();

      fabric.Image.fromURL(
        src,
        (img: FabricImage | null) => {
          if (!img || !fabricCanvasRef.current) return;

          // Scale down if too large
          const maxSize = Math.min(width, height) * 0.3;
          const scale = Math.min(
            maxSize / (img.width || 1),
            maxSize / (img.height || 1),
            1,
          );

          img.set({
            left: width / 2,
            top: height / 2,
            scaleX: scale,
            scaleY: scale,
            originX: "center",
            originY: "center",
          });

          (img as any).elementId = elementId;
          (img as any).elementType = "image";

          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.setActiveObject(img);
          fabricCanvasRef.current.renderAll();

          saveToHistory();
        },
        { crossOrigin: "anonymous" },
      );
    },
    [width, height, saveToHistory],
  );

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const active = fabricCanvasRef.current.getActiveObject();
    if (active && !(active as any).isOverlay) {
      fabricCanvasRef.current.remove(active);
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      setSelectedElementId(null);
      onElementSelect(null);
      saveToHistory();
    }
  }, [onElementSelect, saveToHistory]);

  // Duplicate selected element
  const duplicateSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const active = fabricCanvasRef.current.getActiveObject();
    if (active && !(active as any).isOverlay) {
      active.clone((cloned: FabricObject) => {
        cloned.set({
          left: (active.left || 0) + 20,
          top: (active.top || 0) + 20,
        });
        (cloned as any).elementId = generateElementId();
        fabricCanvasRef.current?.add(cloned);
        fabricCanvasRef.current?.setActiveObject(cloned);
        fabricCanvasRef.current?.renderAll();
        saveToHistory();
      });
    }
  }, [saveToHistory]);

  // Bring to front
  const bringToFront = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const active = fabricCanvasRef.current.getActiveObject();
    if (active) {
      fabricCanvasRef.current.bringToFront(active);
      fabricCanvasRef.current.renderAll();
      saveToHistory();
    }
  }, [saveToHistory]);

  // Send to back
  const sendToBack = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const active = fabricCanvasRef.current.getActiveObject();
    if (active) {
      fabricCanvasRef.current.sendToBack(active);
      // Keep overlay at very back
      const objects = fabricCanvasRef.current.getObjects();
      const overlay = objects.find(
        (obj: FabricObject) => (obj as any).isOverlay,
      );
      if (overlay) {
        fabricCanvasRef.current.sendToBack(overlay);
      }
      fabricCanvasRef.current.renderAll();
      saveToHistory();
    }
  }, [saveToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;

    isUndoRedoRef.current = true;
    historyIndexRef.current--;

    // Restore state would go here

    onHistoryChange(
      historyIndexRef.current > 0,
      historyIndexRef.current < historyRef.current.length - 1,
    );
    isUndoRedoRef.current = false;
  }, [onHistoryChange]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;

    isUndoRedoRef.current = true;
    historyIndexRef.current++;

    // Restore state would go here

    onHistoryChange(
      historyIndexRef.current > 0,
      historyIndexRef.current < historyRef.current.length - 1,
    );
    isUndoRedoRef.current = false;
  }, [onHistoryChange]);

  // Export to data URL
  const exportToDataURL = useCallback(() => {
    if (!fabricCanvasRef.current) return null;
    return fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });
  }, []);

  // Export to PNG file
  const exportToPNG = useCallback(() => {
    const dataURL = exportToDataURL();
    if (!dataURL) return;

    const link = document.createElement("a");
    link.download = `cover-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }, [exportToDataURL]);

  return {
    canvasRef,
    isReady,
    selectedElementId,
    addTextElement,
    addShapeElement,
    addBadgeElement,
    addEmojiElement,
    addImageElement,
    deleteSelected,
    duplicateSelected,
    bringToFront,
    sendToBack,
    undo,
    redo,
    exportToDataURL,
    exportToPNG,
  };
}

// Helper function to create star points
function createStarPoints(
  points: number,
  outerRadius: number,
  innerRadius: number,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const step = Math.PI / points;

  for (let i = 0; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    result.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  }

  return result;
}

// Helper function to create regular polygon points
function createPolygonPoints(
  sides: number,
  radius: number,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const step = (2 * Math.PI) / sides;

  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    result.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  }

  return result;
}
