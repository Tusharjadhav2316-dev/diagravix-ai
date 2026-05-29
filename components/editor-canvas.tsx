// components/editor-canvas.tsx
"use client";

import Konva from "konva";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from "react";

type NodeShape = {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  label?: string;
  type?: string;
};

export type GeneratedDiagram = {
  nodes?: NodeShape[];
  edges?: Array<{ source: string; target: string; relationship?: string; label?: string }>;
};

export interface EditorCanvasHandle {
  getStage: () => Konva.Stage | null;
  getLayer: () => Konva.Layer | null;
  exportPNG: (opts?: { pixelRatio?: number }) => string | null;
}

interface EditorCanvasProps {
  diagram: GeneratedDiagram | null;
  selectedNodeId?: string | null;
  onSelectNode?: (id: string | null) => void;
  onUpdateNode?: (id: string, updates: Partial<NodeShape>) => void;
  onAddNode?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(function EditorCanvas(
  { diagram, onSelectNode, onUpdateNode, onAddNode, className, style },
  ref: Ref<EditorCanvasHandle>
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      getStage: () => stageRef.current,
      getLayer: () => layerRef.current,
      exportPNG: (opts = {}) => {
        const stage = stageRef.current;
        if (!stage) return null;
        layerRef.current?.batchDraw();
        return stage.toDataURL({ pixelRatio: opts.pixelRatio ?? 2 });
      },
    }),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(800, container.clientWidth || 800);
    const height = Math.max(600, container.clientHeight || 600);

    if (!stageRef.current) {
      stageRef.current = new Konva.Stage({
        container,
        width,
        height,
        draggable: true,
      });

      stageRef.current.on('wheel', (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;
        
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const scaleBy = 1.1;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
      });

      layerRef.current = new Konva.Layer();
      stageRef.current.add(layerRef.current);
    } else {
      stageRef.current.width(width);
      stageRef.current.height(height);
    }

    const handleResize = () => {
      if (!container || !stageRef.current) return;
      const w = Math.max(400, container.clientWidth || 800);
      const h = Math.max(300, container.clientHeight || 600);
      stageRef.current.width(w);
      stageRef.current.height(h);
      layerRef.current?.batchDraw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        if (stageRef.current) {
          stageRef.current.destroy();
        }
      } catch {
      } finally {
        stageRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.destroyChildren();

    if (diagram?.edges?.length && diagram?.nodes?.length) {
      diagram.edges.forEach((edge) => {
        const sourceNode = diagram.nodes!.find((n) => n.id === edge.source);
        const targetNode = diagram.nodes!.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          const sx = (sourceNode.x ?? 50) + (sourceNode.width ?? 160) / 2;
          const sy = (sourceNode.y ?? 50) + (sourceNode.height ?? 64) / 2;
          const tx = (targetNode.x ?? 50) + (targetNode.width ?? 160) / 2;
          const ty = (targetNode.y ?? 50) + (targetNode.height ?? 64) / 2;

          // Shorten arrow so it doesn't overlap shapes as much
          const angle = Math.atan2(ty - sy, tx - sx);
          const dist = Math.sqrt((tx - sx)**2 + (ty - sy)**2);
          const shortDist = Math.max(0, dist - 40); // roughly subtract radius of target node
          const adjustedTx = sx + Math.cos(angle) * shortDist;
          const adjustedTy = sy + Math.sin(angle) * shortDist;

          const arrow = new Konva.Arrow({
            points: [sx, sy, adjustedTx, adjustedTy],
            pointerLength: 10,
            pointerWidth: 10,
            fill: "gray",
            stroke: "gray",
            strokeWidth: 2,
          });
          
          layer.add(arrow);
          
          if (edge.relationship) {
             const label = new Konva.Text({
                x: (sx + tx) / 2,
                y: (sy + ty) / 2,
                text: edge.relationship,
                fontSize: 12,
                fill: "gray",
                align: "center",
             });
             label.offsetX(label.width() / 2);
             label.offsetY(label.height() / 2);
             
             const labelBg = new Konva.Rect({
                x: label.x() - label.width()/2 - 4,
                y: label.y() - label.height()/2 - 2,
                width: label.width() + 8,
                height: label.height() + 4,
                fill: "white",
                opacity: 0.9,
                cornerRadius: 4
             });
             layer.add(labelBg);
             layer.add(label);
          }
        }
      });
    }

    if (diagram?.nodes?.length) {
      diagram.nodes.forEach((node) => {
        const group = new Konva.Group({
          x: node.x ?? 50,
          y: node.y ?? 50,
          draggable: true,
        });

        const width = node.width ?? 160;
        const height = node.height ?? 64;
        const type = node.type?.toLowerCase() || "";

        let shape: Konva.Shape;

        if (type === "decision" || type === "relationship") {
          const dW = width + 40;
          const dH = height + 40;
          shape = new Konva.Line({
            points: [
              width/2, (height - dH)/2,
              (width + dW)/2, height/2,
              width/2, (height + dH)/2,
              (width - dW)/2, height/2,
            ],
            closed: true,
            stroke: "#333",
            strokeWidth: 2,
            fill: "#f8f9fa",
            shadowColor: "black",
            shadowBlur: 5,
            shadowOpacity: 0.1,
            shadowOffset: { x: 2, y: 2 }
          });
        } else if (type === "database" || type === "data") {
          shape = new Konva.Path({
             data: `M 0,${height/4} a ${width/2},${height/4} 0 1,0 ${width},0 a ${width/2},${height/4} 0 1,0 -${width},0 l 0,${height/2} a ${width/2},${height/4} 0 1,1 -${width},0 Z`,
             fill: "#f8f9fa",
             stroke: "#333",
             strokeWidth: 2,
             shadowColor: "black",
             shadowBlur: 5,
             shadowOpacity: 0.1,
             shadowOffset: { x: 2, y: 2 }
          });
        } else if (type === "actor") {
           shape = new Konva.Circle({
              radius: 20,
              x: width / 2,
              y: 20,
              stroke: "#333",
              strokeWidth: 2,
              fill: "#f8f9fa",
           });
        } else if (type === "start" || type === "end" || type === "attribute") {
           shape = new Konva.Ellipse({
              radiusX: width / 2,
              radiusY: height / 2,
              x: width / 2,
              y: height / 2,
              stroke: "#333",
              strokeWidth: 2,
              fill: "#f8f9fa",
              shadowColor: "black",
              shadowBlur: 5,
              shadowOpacity: 0.1,
              shadowOffset: { x: 2, y: 2 }
           });
        } else {
          shape = new Konva.Rect({
            width: width,
            height: height,
            cornerRadius: 4,
            stroke: "#333",
            strokeWidth: 2,
            fill: "#f8f9fa",
            shadowColor: "black",
            shadowBlur: 5,
            shadowOpacity: 0.1,
            shadowOffset: { x: 2, y: 2 }
          });
        }

        const textContent = node.label || node.text || node.id;
        const text = new Konva.Text({
          text: textContent,
          fontSize: 14,
          padding: 8,
          width: width,
          align: "center",
          verticalAlign: "middle",
          height: height,
          ellipsis: true,
          fill: "#111"
        });

        if (type === "actor") {
            text.y(45);
            text.height(height - 45);
        }

        group.add(shape);
        group.add(text);

        group.on("click", () => {
          onSelectNode?.(node.id);
        });

        group.on("dragend", (e) => {
          const pos = (e.target as Konva.Group).position();
          onUpdateNode?.(node.id, { x: pos.x, y: pos.y });
        });

        layer.add(group);
      });

      // Auto-fit diagram to canvas
      const stage = stageRef.current;
      if (stage && diagram.nodes.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        diagram.nodes.forEach(n => {
           minX = Math.min(minX, n.x ?? 0);
           minY = Math.min(minY, n.y ?? 0);
           maxX = Math.max(maxX, (n.x ?? 0) + (n.width ?? 160));
           maxY = Math.max(maxY, (n.y ?? 0) + (n.height ?? 64));
        });
        
        // Add padding around the diagram
        minX -= 50; minY -= 50; maxX += 50; maxY += 50;
        const contentW = maxX - minX;
        const contentH = maxY - minY;
        const containerW = stage.width();
        const containerH = stage.height();
        
        // Calculate scale to fit, max scale 1 (so we don't zoom in too much on small diagrams)
        const scale = Math.min(containerW / contentW, containerH / contentH, 1);
        
        stage.scale({ x: scale, y: scale });
        stage.position({
          x: (containerW - contentW * scale) / 2 - minX * scale,
          y: (containerH - contentH * scale) / 2 - minY * scale,
        });
      }
    }

    layer.batchDraw();
  }, [diagram, onSelectNode, onUpdateNode]);

  const handleZoom = (direction: 1 | -1) => {
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const scaleBy = 1.2;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };
    
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };
    
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  };

  const handleReset = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
  };

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "8px", ...style }}>
      {/* ensure parent gives this element a real height (e.g., style={{ height: 600 }} or CSS) */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", gap: "8px" }}>
        <button onClick={() => handleZoom(1)} style={{ padding: "4px 12px", background: "white", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>Zoom In (+)</button>
        <button onClick={() => handleZoom(-1)} style={{ padding: "4px 12px", background: "white", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>Zoom Out (-)</button>
        <button onClick={handleReset} style={{ padding: "4px 12px", background: "white", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>Reset</button>
      </div>
      <div style={{ position: "absolute", right: 12, bottom: 12 }}>
        <button onClick={() => onAddNode?.()} style={{ padding: "4px 12px", background: "#0f172a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Add Node</button>
      </div>
    </div>
  );
});

export default EditorCanvas;
