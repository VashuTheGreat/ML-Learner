import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PORT = "http://localhost:3000/auth"; // Use http if backend is HTTP

const Login = () => {
  const navigate = useNavigate();
  const [userPayload, setUserPayload] = useState(null); // Google info
  const [mode, setMode] = useState(""); // "login" or "signup"
  const [formData, setFormData] = useState({ name: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "73943869696-d9cq3mr6m09bedurmsjbave9jragqogs.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginButton"),
        { theme: "outline", size: "large", width: "250" }
      );

      window.google.accounts.id.prompt();
    }
  }, []);

  const handleCredentialResponse = (response) => {
    try {
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = JSON.parse(window.atob(base64));
      const { email, picture, name, sub: id } = decodedPayload;

      setUserPayload({ email, image: picture, name, id });
      setMode(""); // let user choose Login or SignUp
      setFormData((prev) => ({ ...prev, name: name || "" }));
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res, data;

      if (mode === "signup") {
        // Validation
        if (!formData.name || formData.name.length < 2) throw new Error("Name must be at least 2 characters");
        if (!formData.password || formData.password.length < 6) throw new Error("Password must be at least 6 characters");
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");

        // Signup request
        res = await fetch(`${PORT}/signUp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: userPayload.email,
            password: formData.password,
            image: userPayload.image,
          }),
        });
        data = await res.json();

        if (!res.ok) throw new Error(data.message || "Signup failed");

        // Fetch full user info
        const userRes = await fetch(`${PORT}/getUser/${data.userId}`);
        const userData = await userRes.json();
        if (!userData.success) throw new Error(userData.message || "Failed to fetch user");

        localStorage.setItem("user", JSON.stringify(userData.user));
      } else if (mode === "login") {
        if (!formData.password) throw new Error("Enter password to login");

        // Login request
        res = await fetch(`${PORT}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userPayload.email,
            password: formData.password,
          }),
        });
        data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "Login failed");

        const userRes = await fetch(`${PORT}/getUser/${data.userId}`);
        const userData = await userRes.json();
        if (!userData.success) throw new Error(userData.message || "Failed to fetch user");

        localStorage.setItem("user", JSON.stringify(userData.user));
      }

      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/"); // redirect home
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  if (!userPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-10 w-96 text-center">
          <h1 className="text-2xl font-bold mb-6">Login with Google</h1>
          <div id="googleLoginButton" className="mx-auto"></div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-10 w-96 text-center">
          <h1 className="text-2xl font-bold mb-6">Welcome {userPayload.email}</h1>
          <p className="mb-4 text-gray-600">Choose an option to continue</p>
          <div className="flex justify-around">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-10 w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">{mode === "login" ? "Login" : "Sign Up"}</h1>
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              className="border rounded px-3 py-2 w-full mb-4"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="border rounded px-3 py-2 w-full mb-4"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="border rounded px-3 py-2 w-full mb-4"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          )}
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
            disabled={loading}
          >
            {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
