import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";

const socket = io(import.meta.env.VITE_API_URL);

export default function VideoCall({ workspaceId, userId }) {
  const [peers, setPeers] = useState({});
  const localVideoRef = useRef();
  const peersRef = useRef({});

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;

        socket.emit("joinCall", { workspaceId, userId });

        socket.on("userJoined", ({ userId: otherId, socketId }) => {
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
          });
          peer.on("signal", (signal) =>
            socket.emit("signal", { to: socketId, signal })
          );
          peer.on("stream", (remoteStream) =>
            setPeers((prev) => ({ ...prev, [otherId]: remoteStream }))
          );
          peersRef.current[otherId] = peer;
        });

        socket.on("signal", ({ from, signal }) => {
          if (!peersRef.current[from]) {
            const peer = new SimplePeer({
              initiator: false,
              trickle: false,
              stream,
            });
            peer.on("signal", (s) =>
              socket.emit("signal", { to: from, signal: s })
            );
            peer.on("stream", (remoteStream) =>
              setPeers((prev) => ({ ...prev, [from]: remoteStream }))
            );
            peer.signal(signal);
            peersRef.current[from] = peer;
          } else {
            peersRef.current[from].signal(signal);
          }
        });

        socket.on("userLeft", ({ userId: leftId }) => {
          delete peersRef.current[leftId];
          setPeers((prev) => {
            const copy = { ...prev };
            delete copy[leftId];
            return copy;
          });
        });
      });
  }, [workspaceId, userId]);

  return (
    <div className="flex flex-wrap gap-2">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="w-64 h-48 bg-black rounded"
      />
      {Object.entries(peers).map(([id, stream]) => (
        <Video key={id} stream={stream} />
      ))}
    </div>
  );
}

function Video({ stream }) {
  const ref = useRef();
  useEffect(() => {
    ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay className="w-64 h-48 bg-black rounded" />;
}
