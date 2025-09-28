import React, { useState } from "react";
import axios from "axios";

export default function Profile({ token }) {
  const [profileUrl, setProfileUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfileUrl(res.data.url);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Upload Profile Picture</h2>
      <input type="file" onChange={handleUpload} />
      {profileUrl && (
        <img
          src={profileUrl}
          alt="Profile"
          className="w-32 h-32 rounded-full mt-2"
        />
      )}
    </div>
  );
}
