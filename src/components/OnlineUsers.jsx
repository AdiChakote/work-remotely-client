import { useSocket } from "../context/SocketContext";

export default function OnlineUsers({ allUsers }) {
  const { onlineUsers } = useSocket();

  return (
    <div>
      <h3 className="font-bold">Online Users</h3>
      <ul>
        {allUsers.map((u) => (
          <li key={u._id}>
            {u.name}{" "}
            <span
              className={
                onlineUsers.includes(u._id) ? "text-green-500" : "text-gray-400"
              }
            >
              ●
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
