import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        {
          name,
          email,
          password,
        }
      );

      // Save token and userId
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);

      alert("Signup Successful!");
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 max-w-sm mx-auto mt-10"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
        className="border p-2 rounded"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="border p-2 rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Signup
      </button>
    </form>
  );
}

export default Signup;
