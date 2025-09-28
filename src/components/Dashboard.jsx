import { useEffect, useState } from "react";
import axios from "axios";
import WorkspaceForm from "./WorkspaceForm";
import Chat from "./Chat";
import TaskBoard from "./TaskBoard";
import DocumentEditor from "./DocumentEditor";
import Whiteboard from "./Whiteboard";
import VideoCall from "./VideoCall";
import WorkspaceFileUpload from "./WorkspaceFileUpload";

function WorkspaceDetails({ workspace, userId, handleDelete, handleLeave }) {
  return (
    <div className="mb-4">
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
  const [activeTab, setActiveTab] = useState("chat"); // Chat | Tasks | Docs
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/workspaces`,
          { headers: { Authorization: `Bearer ${token}` } }
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

  const renderActiveTab = () => {
    if (!selectedWorkspace) return null;
    switch (activeTab) {
      case "chat":
        return (
          <Chat
            workspaceId={selectedWorkspace._id}
            token={token}
            userId={userId}
          />
        );
      case "tasks":
        return (
          <TaskBoard
            workspaceId={selectedWorkspace._id}
            token={token}
            userId={userId}
          />
        );
      case "docs":
        return <DocumentEditor workspaceId={selectedWorkspace._id} />;
      case "whiteboard":
        return (
          <Whiteboard workspaceId={selectedWorkspace._id} userId={userId} />
        );
      case "video":
        return (
          <VideoCall workspaceId={selectedWorkspace._id} userId={userId} />
        );
      case "files":
        return (
          <WorkspaceFileUpload
            workspaceId={selectedWorkspace._id}
            token={token}
            onUpload={(file) => {
              console.log("Uploaded file:", file);
              // Optionally, update workspace state to show files
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 flex flex-col gap-4">
        <h2 className="font-bold text-lg">Workspaces</h2>

        {workspaces.map((ws) => (
          <button
            key={ws._id}
            className={`p-2 rounded ${
              selectedWorkspace?._id === ws._id
                ? "bg-blue-400 text-white"
                : "bg-white"
            }`}
            onClick={() => {
              setSelectedWorkspace(ws);
              setActiveTab("chat");
            }}
          >
            {ws.name}
          </button>
        ))}

        <WorkspaceForm token={token} setWorkspaces={setWorkspaces} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {selectedWorkspace ? (
          <>
            <WorkspaceDetails
              workspace={selectedWorkspace}
              userId={userId}
              handleDelete={handleDelete}
              handleLeave={handleLeave}
            />

            {/* Tabs */}
            <div className="flex gap-2 mb-2">
              <button
                className={`px-4 py-2 rounded-t ${
                  activeTab === "chat"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={`px-4 py-2 rounded-t ${
                  activeTab === "tasks"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("tasks")}
              >
                Task Board
              </button>
              <button
                className={`px-4 py-2 rounded-t ${
                  activeTab === "docs"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("docs")}
              >
                Documents
              </button>
              <button
                className={`px-4 py-2 rounded-t ${
                  activeTab === "whiteboard"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("whiteboard")}
              >
                Whiteboard
              </button>
              <button
                className={`px-4 py-2 rounded-t ${
                  activeTab === "video"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("video")}
              >
                Video Call
              </button>
              <button
                className={`px-4 py-2 rounded-t ${
                  activeTab === "files"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab("files")}
              >
                Files
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 border rounded p-2 min-h-[400px]">
              {renderActiveTab()}
            </div>
          </>
        ) : (
          <h1 className="text-xl">Select a workspace</h1>
        )}
      </main>
    </div>
  );
}
