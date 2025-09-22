import { useState } from "react";
import axios from "axios";

export default function WorkspaceForm({ token, setWorkspaces }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/workspaces/create`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkspaces((prev) => [...prev, res.data]); // add new workspace to list
      setName(""); // clear input
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Workspace Name"
          className="border p-2 flex-1 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
