import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate, useParams } from "react-router-dom";
import API from "../utils/api";
import { motion } from "framer-motion";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { toast, Toaster } from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const SignatureDraggable = ({ signatureText, selectedFont, position, setPosition, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dndDragging,
  } = useDraggable({ id: "signature" });

  const style = {
    fontFamily: selectedFont,
    fontSize: "20px",
    color: "#000",
    position: "absolute",
    background: dndDragging ? "#fffbe6" : "transparent",
    padding: "4px 8px",
    border: dndDragging ? "2px dashed #dc2626" : "none",
    borderRadius: "6px",
    cursor: "move",
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 10,
    userSelect: "none",
    touchAction: "none",
    textShadow: "1px 1px 2px #dc2626",
    boxShadow: dndDragging ? "0 0 0 2px #dc2626" : "0 2px 6px rgba(220, 38, 38, 0.4)",
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    transition: dndDragging ? "none" : "all 0.2s",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {signatureText || "Your signature"}
    </div>
  );
};

export default function PDFPreview() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [signing, setSigning] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [selectedFont, setSelectedFont] = useState("cursive");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [placedSignatures, setPlacedSignatures] = useState([]);
  const [finalize, setFinalize] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [renderedPageHeight, setRenderedPageHeight] = useState(0);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoc = async () => {
      const token = localStorage.getItem("token");
      const res = await API.get("/docs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = res.data.find((d) => d._id === id);
      setDoc(found);
      setLoading(false);
    };
    fetchDoc();
  }, [id]);

  const fetchPlacedSignatures = async () => {
    const token = localStorage.getItem("token");
    const res = await API.get(`/signature/file/${doc._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPlacedSignatures(res.data);
  };

  useEffect(() => {
    if (doc) fetchPlacedSignatures();
  }, [doc]);

  const handleDrop = async ({ x, y }) => {
    const token = localStorage.getItem("token");

    try {
      await API.post(
        "/signature/place",
        {
          fileId: doc._id,
          pageNumber: currentPage,
          xCoordinate: x,
          yCoordinate: y,
          signature: signatureText,
          font: selectedFont,
          renderedPageHeight,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Signature placed!");
      await fetchPlacedSignatures();
      setSigning(false);
      setFinalize(true);
      setSignatureText("");
    } catch {
      toast.error("Failed to place signature.");
    }
  };

  const handleFinalize = async () => {
    const token = localStorage.getItem("token");
    try {
      toast.loading("Finalizing signature...");
      const sigId = placedSignatures[0]?._id;
      if (!sigId) return toast.error("No signature to finalize.");

      await API.post(`/signature/accept/${sigId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await API.post("/signature/finalize", { fileId: doc._id }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss();
      toast.success("Signed PDF generated!");
      window.open(`${BASE_URL}/${res.data.signedFile}`, "_blank");
      navigate("/home");
    } catch {
      toast.dismiss();
      toast.error("Finalization failed.");
    }
  };

  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) return toast.error("Enter a reason.");

    const sigId = placedSignatures[0]?._id;
    const token = localStorage.getItem("token");

    try {
      await API.post(`/signature/reject/${sigId}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Document rejected.");
      navigate("/home");
    } catch {
      toast.error("Rejection failed.");
    }
  };

  const handleRemoveSignature = async (sigId) => {
    const token = localStorage.getItem("token");
    try {
      await API.delete(`/signature/remove/${sigId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPlacedSignatures();
      toast.success("Signature removed.");
      setFinalize(false);
    } catch {
      toast.error("Failed to remove.");
    }
  };

  if (loading) return <div className="text-center py-10 text-red-500">Loading...</div>;
  if (!doc) return <div className="text-center py-10 text-red-500">Document not found.</div>;

  const fileUrl = `${BASE_URL}/${doc.filepath}`;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold text-center mb-6">{doc.originalname}</h1>

      <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
        {/* PDF Viewer */}
        <div className="bg-[#111] rounded-xl p-4 w-full lg:w-3/4 border border-[#dc2626] shadow-md">
          <DndContext
            onDragStart={(e) => e.active.id === "signature" && setPosition((p) => ({ ...p }))}
            onDragEnd={(e) => {
              if (e.active.id === "signature") {
                const { delta } = e;
                setPosition((p) => ({
                  x: p.x + delta.x,
                  y: p.y + delta.y,
                }));
              }
            }}
          >
            <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              {Array.from({ length: numPages }, (_, index) => (
                <div key={index} className="relative mb-4">
                  <Page
                    pageNumber={index + 1}
                    width={580}
                    onLoadSuccess={({ height }) =>
                      index === 0 && setRenderedPageHeight(height)
                    }
                  />
                  {signing && index === 0 && (
                    <SignatureDraggable
                      signatureText={signatureText}
                      selectedFont={selectedFont}
                      position={position}
                      setPosition={setPosition}
                    />
                  )}
                  {placedSignatures
                    .filter((sig) => sig.pageNumber === index + 1)
                    .map((sig, i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          top: sig.yCoordinate,
                          left: sig.xCoordinate,
                          fontFamily: sig.font,
                          fontSize: "18px",
                          padding: "2px 6px",
                          background: "#111",
                          border: "1px solid #dc2626",
                          borderRadius: "6px",
                          color: "#fff",
                        }}
                      >
                        <button
                          onClick={() => handleRemoveSignature(sig._id)}
                          className="absolute top-[-10px] right-[-10px] bg-[#dc2626] text-white rounded-full text-xs w-5 h-5"
                        >
                          ×
                        </button>
                        {sig.signature}
                      </div>
                    ))}
                </div>
              ))}
            </Document>
          </DndContext>
        </div>

        {/* Control Panel */}
        <div className="w-full lg:w-1/4 space-y-4">
          <button
            onClick={() => {
              setSigning(true);
              const user = JSON.parse(localStorage.getItem("user"));
              setSignatureText(user?.name || "");
            }}
            className="w-full py-2 bg-[#dc2626] text-white rounded hover:bg-red-700"
          >
            ✍️ Sign Document
          </button>

          {signing && (
            <>
              <input
                className="w-full px-3 py-2 rounded border border-[#dc2626] bg-[#111] text-white"
                placeholder="Type your signature"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
              />
              <select
                className="w-full px-3 py-2 rounded border border-[#dc2626] bg-[#111] text-white"
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
              >
                <option value="cursive">Cursive</option>
                <option value="Pacifico">Pacifico</option>
                <option value="Great Vibes">Great Vibes</option>
              </select>
              <button
                onClick={() => handleDrop(position)}
                className="w-full mt-2 py-2 bg-[#dc2626] text-white rounded hover:bg-red-700"
              >
                Save
              </button>
            </>
          )}

          {placedSignatures.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleFinalize}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✅ Accept
              </button>
              <button
                onClick={() => setShowRejectReason(true)}
                className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ❌ Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectReason && (
        <div className="fixed top-24 left-4 right-4 max-w-md mx-auto bg-[#111] border border-[#dc2626] text-white p-6 rounded-xl shadow-lg z-50">
          <h3 className="text-lg font-semibold mb-2">Reject Document</h3>
          <textarea
            className="w-full p-3 rounded bg-black border border-[#dc2626]"
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason"
          />
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => setShowRejectReason(false)} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
              Cancel
            </button>
            <button onClick={handleReject} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
