import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { io } from "socket.io-client";
import { saveAs } from "file-saver";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket", "polling"],
});

export default function Whiteboard({ workspaceId, userId }) {
  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [lines, setLines] = useState([]); // each line: { points: [], stroke, strokeWidth, id }

  // simple id generator
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  useEffect(() => {
    if (!workspaceId) return;

    // join whiteboard room
    socket.emit("joinWhiteboard", { workspaceId, userId });

    // receive a single line from others
    socket.on("whiteboard:draw", ({ line }) => {
      // avoid duplicates if you want (client-side id compare). For now push.
      setLines((prev) => [...prev, line]);
    });

    // an undo request from another client
    socket.on("whiteboard:undo", () => {
      setLines((prev) => prev.slice(0, -1));
    });

    // clear from others
    socket.on("whiteboard:clear", () => {
      setLines([]);
    });

    // optional history if server provides on join
    socket.on("whiteboard:history", ({ lines: serverLines }) => {
      if (serverLines) setLines(serverLines);
    });

    return () => {
      socket.off("whiteboard:draw");
      socket.off("whiteboard:undo");
      socket.off("whiteboard:clear");
      socket.off("whiteboard:history");
    };
  }, [workspaceId, userId]);

  // start drawing
  const handleMouseDown = (e) => {
    if (!workspaceId) return;
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const id = genId();
    const newLine = {
      id,
      points: [pos.x, pos.y],
      stroke: "#000000",
      strokeWidth: 3,
    };
    setCurrentLine(newLine);
    setLines((prev) => [...prev, newLine]);
  };

  // drawing move
  const handleMouseMove = (e) => {
    if (!isDrawing || !currentLine) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines((prev) => {
      const copy = prev.slice();
      const last = copy[copy.length - 1];
      if (!last || last.id !== currentLine.id) return prev;
      last.points = [...last.points, point.x, point.y];
      return copy;
    });

    // update currentLine's local copy
    setCurrentLine((prev) => ({
      ...prev,
      points: [...prev.points, point.x, point.y],
    }));
  };

  // finish stroke
  const handleMouseUp = () => {
    if (!isDrawing || !currentLine) return;
    setIsDrawing(false);

    // broadcast the line to server (others)
    socket.emit("whiteboard:draw", { workspaceId, line: currentLine });

    setCurrentLine(null);
  };

  // undo: remove last line and notify
  const handleUndo = () => {
    setLines((prev) => {
      const updated = prev.slice(0, -1);
      // emit undo
      socket.emit("whiteboard:undo", { workspaceId });
      return updated;
    });
  };

  // clear board
  const handleClear = () => {
    setLines([]);
    socket.emit("whiteboard:clear", { workspaceId });
  };

  // export as PNG
  const handleExport = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    // download using file-saver
    saveAs(uri, `whiteboard-${workspaceId}.png`);
    // optionally also send to server to persist
    // socket.emit("whiteboard:save", { workspaceId, dataUrl: uri });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleUndo}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Undo
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-red-200 rounded hover:bg-red-300"
        >
          Clear
        </button>
        <button
          onClick={handleExport}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export PNG
        </button>
      </div>

      <div className="flex-1 border rounded">
        <Stage
          width={window.innerWidth - 300} // crude; you can compute container width
          height={600}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
          style={{ background: "#fff" }}
        >
          <Layer>
            {lines.map((l) => (
              <Line
                key={l.id}
                points={l.points}
                stroke={l.stroke}
                strokeWidth={l.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
