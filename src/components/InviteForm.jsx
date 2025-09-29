import { useState } from "react";
import axios from "axios";

export default function InviteForm({ workspaceId }) {
  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    await axios.post(`http://localhost:4000/workspaces/${workspaceId}/invite`, {
      email,
    });
    alert("Invite sent!");
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleInvite}
        className="ml-2 bg-blue-500 text-white px-3 py-2 rounded"
      >
        Send Invite
      </button>
    </div>
  );
}
