import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Upload from "../components/Upload";
import { TypeAnimation } from "react-type-animation";
import API from "../utils/api";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [docs, setDocs] = useState([]);
  const [Pendocs, setPendocs] = useState([]);
  const [Signeddocs, setSigneddocs] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [rejected, setrejected] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token) {
      navigate("/");
    } else {
      setUsername(user.name);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/docs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocs(res.data);
      } catch (err) {
        console.error("Error fetching documents", err);
      }
    };

    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/docs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendocs(res.data);
      } catch (err) {
        console.error("Error fetching documents", err);
      }
    };

    const fetchSignedDoc = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/docs/signed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSigneddocs(res.data);
      } catch (err) {
        console.error("Error fetching documents", err);
      }
    };

    const fetchRejecDoc = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/docs/rejected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setrejected(res.data);
      } catch (error) {
        console.error("Error in fetching Docs", error);
      }
    };

    fetchDocs();
    fetchPending();
    fetchSignedDoc();
    fetchRejecDoc();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogin(true);
    navigate("/");
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {isLoggedIn && (
        <div className="flex justify-end p-4">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* === IMAGE + CONTENT SIDE BY SIDE === */}
      <div className="flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 gap-10">
        {/* LEFT IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src="public/pdfupload.png" // Replace this with your image path (e.g. in public/assets folder)
            alt="Developer"
            className="w-72 md:w-96 lg:w-[300px] drop-shadow-[0_0_8px_red]"
          />
        </div>

        {/* RIGHT TEXT + UPLOAD */}
        <div className="w-full lg:w-1/2">
          <h1
            className="text-3xl font-bold mb-6 text-white text-center lg:text-left"
            style={{ textShadow: "0 0 8px red" }}
          >
            Hii
            <span className="text-red-400 ml-2 mr-2">{username}</span>
            <span className="text-white">
              <TypeAnimation
                sequence={[
                  ", upload your file below...",
                  2000,
                  ", ready to sign documents?",
                  2000,
                  ", let’s manage your paperwork!",
                  2000,
                ]}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                style={{ display: "inline-block" }}
              />
            </span>
          </h1>
          <Upload />
        </div>
      </div>

      {/* DOCUMENT STATS */}
      <div className="max-w-4xl mx-auto mt-12 p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => navigate("/my-documents")}
            className="bg-red-900/30 rounded-xl p-6 shadow flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition hover:scale-105 hover:bg-red-900/50"
          >
            <span className="text-4xl mb-2">📄</span>
            <span className="font-semibold text-lg" style={{ textShadow: "0 0 6px red" }}>
              My Documents
            </span>
            <span className="text-gray-300 text-sm mt-1">{docs.length} uploaded</span>
          </div>

          <div
            onClick={() => navigate("/pending-doc")}
            className="bg-yellow-800/30 rounded-xl p-6 shadow flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition hover:scale-105 hover:bg-yellow-800/50"
          >
            <span className="text-4xl mb-2">✍️</span>
            <span className="font-semibold text-lg" style={{ textShadow: "0 0 6px red" }}>
              Pending Signatures
            </span>
            <span className="text-gray-300 text-sm mt-1">{Pendocs.length} pending</span>
          </div>

          <div
            onClick={() => navigate("/signed-doc")}
            className="bg-green-800/30 rounded-xl p-6 shadow flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition hover:scale-105 hover:bg-green-800/50"
          >
            <span className="text-4xl mb-2">✅</span>
            <span className="font-semibold text-lg" style={{ textShadow: "0 0 6px red" }}>
              Completed
            </span>
            <span className="text-gray-300 text-sm mt-1">{Signeddocs.length} signed</span>
          </div>

          <div
            onClick={() => navigate("/rejected-doc")}
            className="bg-red-800/30 rounded-xl p-6 shadow flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition hover:scale-105 hover:bg-red-800/50"
          >
            <span className="text-4xl mb-2">❌</span>
            <span className="font-semibold text-lg" style={{ textShadow: "0 0 6px red" }}>
              Rejected Signatures
            </span>
            <span className="text-gray-300 text-sm mt-1">{rejected.length} rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
