import { useEffect, useState } from "react";
import axios from "axios";
import WorkspaceForm from "./WorkspaceForm";

// Component to show workspace details and actions
function WorkspaceDetails({ workspace, userId, handleDelete, handleLeave }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{workspace.name}</h1>

      <h2 className="mt-2 font-semibold">Members:</h2>
      <ul className="list-disc ml-6">
        {workspace.members?.map((member) => (
          <li key={member._id}>{member.name || member.email}</li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        {workspace.owner === userId && (
          <button
            className="bg-red-500 text-white p-2 rounded"
            onClick={handleDelete}
          >
            Delete Workspace
          </button>
        )}
        <button
          className="bg-yellow-500 text-white p-2 rounded"
          onClick={handleLeave}
        >
          Leave Workspace
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/workspaces`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkspaces(res.data);
      } catch (err) {
        console.log("Error fetching workspaces:", err);
      }
    };
    fetchWorkspaces();
  }, [token]);

  const handleDelete = async () => {
    if (!selectedWorkspace) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/workspaces/delete/${
          selectedWorkspace._id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkspaces((prev) =>
        prev.filter((ws) => ws._id !== selectedWorkspace._id)
      );
      setSelectedWorkspace(null);
    } catch (err) {
      console.log("Error deleting workspace:", err);
    }
  };

  const handleLeave = async () => {
    if (!selectedWorkspace) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/workspaces/leave/${
          selectedWorkspace._id
        }`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkspaces((prev) =>
        prev.filter((ws) => ws._id !== selectedWorkspace._id)
      );
      setSelectedWorkspace(null);
    } catch (err) {
      console.log("Error leaving workspace:", err);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 flex flex-col gap-4">
        <h2 className="font-bold text-lg">Workspaces</h2>

        {/* Workspace list */}
        {workspaces.map((ws) => (
          <button
            key={ws._id}
            className={`p-2 rounded ${
              selectedWorkspace?._id === ws._id
                ? "bg-blue-400 text-white"
                : "bg-white"
            }`}
            onClick={() => setSelectedWorkspace(ws)}
          >
            {ws.name}
          </button>
        ))}

        {/* Workspace creation */}
        <WorkspaceForm token={token} setWorkspaces={setWorkspaces} />

        {/* Placeholders for future modules */}
        <button disabled className="mt-4 p-2 bg-gray-300 rounded">
          Chat
        </button>
        <button disabled className="mt-2 p-2 bg-gray-300 rounded">
          Task Board
        </button>
        <button disabled className="mt-2 p-2 bg-gray-300 rounded">
          Documents
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {selectedWorkspace ? (
          <>
            <WorkspaceDetails
              workspace={selectedWorkspace}
              userId={userId}
              handleDelete={handleDelete}
              handleLeave={handleLeave}
            />
            <div className="mt-6 h-64 border rounded p-2">
              <Chat
                workspaceId={selectedWorkspace._id}
                token={token}
                userId={userId}
              />
            </div>
          </>
        ) : (
          <h1 className="text-xl">Select a workspace</h1>
        )}
      </main>
    </div>
  );
}
