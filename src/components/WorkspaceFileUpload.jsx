import React from "react";
import axios from "axios";

export default function WorkspaceFileUpload({ workspaceId, token, onUpload }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/workspaces/${workspaceId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onUpload(res.data.file);
    } catch (err) {
      console.log(err);
    }
  };

  return <input type="file" onChange={handleUpload} />;
}
