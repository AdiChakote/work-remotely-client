import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

export default function Notifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });
  }, [socket]);

  return (
    <div>
      <h3 className="font-bold">Notifications</h3>
      <ul>
        {notifications.map((n, i) => (
          <li key={i} className="text-sm bg-gray-100 p-2 rounded mt-1">
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
