import { useState, useRef } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Upload() {
  const [pdfFile, setPdfFile] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef();

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please select a PDF file first!");
      return;
    }
    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const token = localStorage.getItem("token");
      await API.post("/docs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Upload successful!");
      setPdfFile(null);
    } catch (err) {
      toast.error(
        (err.response && err.response.data && err.response.data.msg) ||
          "Upload failed!"
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-black text-white">
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <motion.div
          className="bg-black/50 border-2 border-dashed border-red-500 rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer shadow-md transition hover:border-red-400"
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(255, 0, 0, 0.5)" }}
        >
          <input
            type="file"
            accept="application/pdf"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <svg
            className="w-16 h-16 text-red-400 mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 48 48"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 32v4a4 4 0 004 4h8a4 4 0 004-4v-4M12 20l12-12m0 0l12 12m-12-12v28"
            />
          </svg>
          <span className="text-red-400 text-lg mb-2 drop-shadow-[0_0_4px_red]">
            {pdfFile ? pdfFile.name : "Click or drag PDF here to upload"}
          </span>
          <span className="text-xs text-gray-400">(PDF only)</span>
        </motion.div>
        <motion.button
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-2 rounded-lg font-bold text-lg shadow-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all drop-shadow-[0_0_4px_red]"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Upload
        </motion.button>
      </form>
    </div>
  );
}
