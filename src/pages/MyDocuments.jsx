import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Download, Eye, Trash2 } from "lucide-react";

export default function MyDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

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
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowAlert(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/docs/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Document deleted!");
      setDocs(docs.filter((doc) => doc._id !== deleteId));
    } catch (err) {
      console.error("Error deleting document", err);
      toast.error("Failed to delete document");
    } finally {
      setShowAlert(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowAlert(false);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center mt-8">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-2 text-white text-center"
          style={{ textShadow: "0 0 8px red" }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          📄 My Uploaded PDFs
        </motion.h2>
        <p className="text-gray-300 mb-6 text-center max-w-xl">
          All your uploaded documents are listed below. Click{" "}
          <span className="font-semibold text-red-500" style={{ textShadow: "0 0 6px red" }}>
            Preview
          </span>{" "}
          to view or sign your PDF.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-2 pb-12">
        {loading ? (
          <div className="text-center text-gray-500 py-12 text-lg">Loading...</div>
        ) : docs.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-6xl mb-4">📂</span>
            <p className="text-gray-500 text-lg">No documents found. Try uploading one!</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {docs.map((doc, idx) => (
              <motion.div
                key={doc._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between bg-white/10 backdrop-blur-md border border-red-200 rounded-2xl shadow-xl hover:shadow-red-300 transition"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
              >
                <div>
                  <p
                    className="font-bold text-white text-lg flex items-center gap-2"
                    style={{ textShadow: "0 0 5px red" }}
                  >
                    <span className="text-red-500">📄</span>
                    {doc.originalname}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Uploaded on{" "}
                    <span className="font-medium">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="flex flex-row gap-4 mt-4 md:mt-0">
                  <motion.button
                    onClick={() => navigate(`/preview/${doc._id}`)}
                    className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                  <a
                    href={`http://localhost:5000/uploads/${doc.filename}`}
                    download={doc.originalname}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow transition-all flex items-center justify-center"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow transition-all flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showAlert && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md shadow-lg border border-red-200 rounded-lg p-4 flex items-center gap-4 text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-red-600 h-6 w-6 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-lg">Are you sure you want to delete this document?</span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded bg-white hover:bg-gray-100"
              onClick={cancelDelete}
            >
              No
            </button>
            <button
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
            >
              Yes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
