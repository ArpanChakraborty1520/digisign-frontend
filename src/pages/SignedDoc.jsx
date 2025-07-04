import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Download, Eye, Trash2 } from "lucide-react";
import { FiInfo } from "react-icons/fi";

const SignedDoc = () => {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [infoDoc, setInfoDoc] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/docs/signed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
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
      await API.delete(`/docs/signed/${deleteId}`, {
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

  const handleInfo = async (doc) => {
    setInfoDoc(doc);
    setAuditTrail([]);
    setAuditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/signature/audit/${doc._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditTrail(res.data);
    } catch (err) {
      setAuditTrail([]);
    } finally {
      setAuditLoading(false);
      document.getElementById("my_modal_1").showModal();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col items-center mt-8">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-2 text-white"
          style={{ textShadow: "0 0 20px #dc2626, 0 0 10px #dc2626" }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          📄 Signed PDFs
        </motion.h2>
        <p className="text-gray-300 mb-6 text-center max-w-xl" style={{ textShadow: "0 0 6px #dc2626" }}>
          All your signed documents are listed below. Click{" "}
          <span className="font-semibold text-red-500">Preview</span> to view your PDF.
        </p>
      </div>
      <div className="max-w-2xl mx-auto px-2 pb-12">
        {loading ? (
          <div className="text-center text-gray-400 py-12 text-lg">Loading...</div>
        ) : docs.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-6xl mb-4">📂</span>
            <p className="text-gray-400 text-lg">No signed documents found.</p>
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
                  <p className="font-bold text-white text-lg flex items-center gap-2" style={{ textShadow: "0 0 6px #dc2626" }}>
                    <span className="text-red-500">📄</span>
                    {doc.originalname}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Uploaded on{" "}
                    <span className="font-medium">{new Date(doc.uploadedAt).toLocaleString()}</span>
                  </p>
                  {!doc.signedFile && (
                    <span className="text-red-500 text-xs">No signed PDF available</span>
                  )}
                </div>
                <div className="flex flex-row gap-4 mt-4 md:mt-0">
                  {doc.signedFile ? (
                    <motion.button
                      onClick={() => window.open(`http://localhost:5000/${doc.signedFile}`, "_blank")}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow transition-all flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <span className="text-red-500 text-xs">No signed PDF available</span>
                  )}
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow transition-all flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <motion.button
                    className="text-4xl flex justify-center items-center bg-white hover:bg-red-700 text-red-600 hover:text-white rounded-full p-1 shadow-md"
                    type="button"
                    whileHover={{ scale: 1.15, rotate: 20 }}
                    whileTap={{ scale: 0.95, rotate: -10 }}
                    animate={{ rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 2 } }}
                    title="Info"
                    onClick={() => handleInfo(doc)}
                  >
                    <FiInfo />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showAlert && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 bg-[#1c1c1c] text-white shadow-lg border border-red-500 rounded-lg p-4 flex items-center gap-4">
          <span className="text-red-500 text-lg font-semibold">⚠️ Confirm Delete</span>
          <span>Are you sure you want to delete this signed document?</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-800 rounded text-white" onClick={cancelDelete}>
              No
            </button>
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white" onClick={confirmDelete}>
              Yes
            </button>
          </div>
        </div>
      )}

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box bg-[#111] text-white border border-red-600 rounded-lg">
          <h3 className="font-bold text-lg text-red-400">Document Info</h3>
          {infoDoc && (
            <div className="py-4 space-y-2">
              <div><span className="font-semibold">File Name:</span> {infoDoc.originalname}</div>
              <div><span className="font-semibold">Uploaded:</span> {new Date(infoDoc.uploadedAt).toLocaleString()}</div>
              <div className="mt-4">
                <span className="font-semibold">Audit Info:</span>
                {auditLoading ? (
                  <div className="text-gray-400 text-sm">Loading audit info...</div>
                ) : auditTrail && auditTrail.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto mt-2">
                    <table className="table-auto w-full text-sm text-gray-200">
                      <thead>
                        <tr className="text-red-400">
                          <th className="px-2 py-1 text-left">Name</th>
                          <th className="px-2 py-1 text-left">Email</th>
                          <th className="px-2 py-1 text-left">IP</th>
                          <th className="px-2 py-1 text-left">Signed At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditTrail.map((entry, idx) => (
                          <tr key={idx}>
                            <td className="px-2 py-1">{entry.signer?.name || "-"}</td>
                            <td className="px-2 py-1">{entry.signer?.email || "-"}</td>
                            <td className="px-2 py-1">{entry.ipAddress || "-"}</td>
                            <td className="px-2 py-1">{entry.signedAt ? new Date(entry.signedAt).toLocaleString() : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No audit info found.</div>
                )}
              </div>
            </div>
          )}
          <div className="modal-action">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white" onClick={() => document.getElementById("my_modal_1").close()}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default SignedDoc;
