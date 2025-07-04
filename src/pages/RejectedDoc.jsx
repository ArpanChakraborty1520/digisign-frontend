import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const RejectedDoc = () => {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/docs/rejected", {
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center mt-8">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-2 text-white"
          style={{ textShadow: "0 0 8px #dc2626" }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          📄 Rejected PDFs
        </motion.h2>
        <p
          className="text-gray-300 mb-6 text-center max-w-xl"
          style={{ textShadow: "0 0 6px #dc2626" }}
        >
          All your rejected documents are listed below.
        </p>
      </div>
      <div className="max-w-3xl mx-auto px-2 pb-16">
        {loading ? (
          <div className="text-center text-gray-400 py-16 text-lg">
            Loading...
          </div>
        ) : docs.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-6xl mb-4">📂</span>
            <p className="text-gray-400 text-lg">No rejected documents found.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {docs.map((doc, idx) => (
              <motion.div
                key={doc._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between bg-white/5 border border-red-500 rounded-2xl shadow-xl hover:shadow-red-500 transition-all"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
              >
                <div>
                  <p
                    className="font-bold text-white text-lg flex items-center gap-2"
                    style={{ textShadow: "0 0 6px #dc2626" }}
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
                  {doc.rejectReason && (
                    <p className="text-red-400 text-sm mt-2">
                      <span className="font-semibold">Rejected Reason:</span>{" "}
                      {doc.rejectReason}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RejectedDoc;
