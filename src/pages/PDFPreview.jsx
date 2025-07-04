import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate, useParams } from "react-router-dom";
import API from "../utils/api";
import { motion } from "framer-motion";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { toast, Toaster } from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

function SignatureDraggable({
  signatureText,
  selectedFont,
  position,
  setPosition,
  isDragging,
}) {
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
    boxShadow: dndDragging
      ? "0 0 0 2px #dc2626"
      : "0 2px 6px rgba(220, 38, 38, 0.4)",
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
}

export default function PDFPreview() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [signing, setSigning] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [selectedFont, setSelectedFont] = useState("cursive");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [placedSignatures, setPlacedSignatures] = useState([]);
  const [finalize, setfinalize] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [renderedPageHeight, setRenderedPageHeight] = useState(0);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

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
    if (doc) {
      fetchPlacedSignatures();
    }
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
          renderedPageHeight: renderedPageHeight,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Signature placed!");
      await fetchPlacedSignatures();
      setSigning(false);
      setfinalize(true);
      setSignatureText("");
    } catch (err) {
      toast.error("Failed to place signature.");
    }
  };

  const handleFinalize = async () => {
    const token = localStorage.getItem("token");
    try {
      toast.loading("Accepting signature...");
      const sigId = placedSignatures[0]?._id;
      if (!sigId) return toast.error("No signature to accept.");

      await API.post(`/signature/accept/${sigId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss();
      toast.success("Signature accepted!");

      toast.loading("Generating signed PDF...");
      const res = await API.post(
        "/signature/finalize",
        { fileId: doc._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.dismiss();
      toast.success("Signed PDF ready!");
      window.open(`${import.meta.env.VITE_API_URL}/${res.data.signedFile}`, "_blank");
      navigate("/home");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to finalize signed PDF.");
    }
  };

  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (!reason) return toast.error("Please provide a reason.");
    const sigId = placedSignatures[0]?._id;

    const token = localStorage.getItem("token");
    try {
      await API.post(
        `/signature/reject/${sigId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Document rejected.");
      navigate("/home");
    } catch (err) {
      toast.error("Failed to reject the document.");
    }
  };

  const handleRemoveSignature = async (sigId) => {
    const token = localStorage.getItem("token");
    try {
      await API.delete(`/signature/remove/${sigId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPlacedSignatures();
      toast.success("Signature removed");
      setfinalize(false);
    } catch (err) {
      toast.error("Failed to remove signature");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-black text-white">
        <motion.div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span style={{ color: "#dc2626" }}>Loading PDF...</span>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-black text-white">
        <span className="text-4xl mb-2">❌</span>
        <span className="text-lg">Document not found.</span>
      </div>
    );
  }

  const fileUrl = `${import.meta.env.VITE_API_URL}/${doc.filepath}`;

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-black text-white">
      <Toaster position="top-center" />
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center break-words max-w-full" style={{ textShadow: "1px 1px 2px #dc2626" }}>
        {doc.originalname}
      </h2>

      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-6">
        {/* PDF Viewer */}
        <motion.div
          className="rounded-2xl p-4 w-full lg:w-3/4 flex flex-col items-center relative bg-[#111]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ boxShadow: "0 4px 20px rgba(220,38,38,0.6)" }}
        >
          <div className="w-full overflow-auto rounded-lg border border-[#dc2626] p-2 max-h-[75vh]">
            <DndContext
              onDragStart={(e) => {
                if (e.active.id === "signature") setIsDragging(true);
              }}
              onDragEnd={(e) => {
                if (e.active.id === "signature") {
                  setIsDragging(false);
                  const { delta } = e;
                  const newX = position.x + delta.x;
                  const newY = position.y + delta.y;
                  setPosition({ x: newX, y: newY });
                }
              }}
            >
              <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from({ length: numPages }, (_, index) => (
                  <div key={`page_${index + 1}`} className="relative">
                    <Page
                      pageNumber={index + 1}
                      width={580}
                      className="mx-auto my-4 shadow"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
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
                        isDragging={isDragging}
                      />
                    )}
                    {placedSignatures
                      .filter((sig) => sig.pageNumber === index + 1)
                      .map((sig, i) => (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            left: `${sig.xCoordinate}px`,
                            top: `${sig.yCoordinate}px`,
                            fontFamily: sig.font,
                            fontSize: "20px",
                            color: "#fff",
                            background: "#000",
                            border: "1px solid #dc2626",
                            textShadow: "1px 1px 2px #dc2626",
                            boxShadow: "0 2px 10px rgba(220, 38, 38, 0.6)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          <button
                            onClick={() => handleRemoveSignature(sig._id)}
                            style={{
                              position: "absolute",
                              top: "-10px",
                              right: "-10px",
                              background: "#111",
                              border: "1px solid #dc2626",
                              color: "#fff",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              fontSize: "14px",
                              zIndex: 2,
                              cursor: "pointer",
                            }}
                          >
                            ✖
                          </button>
                          {sig.signature}
                        </div>
                      ))}
                  </div>
                ))}
              </Document>
            </DndContext>
          </div>
        </motion.div>

        {/* Right Controls */}
        <div className="w-full lg:w-[220px] flex flex-col items-end gap-3">
          <button
            onClick={() => {
              setSigning(true);
              const user = JSON.parse(localStorage.getItem("user"));
              setSignatureText(user.name);
            }}
            className="px-4 py-2 rounded text-white bg-[#dc2626] hover:bg-red-700 transition w-full"
            style={{ boxShadow: "0 2px 8px rgba(220, 38, 38, 0.6)" }}
          >
            ✍️ Sign Document
          </button>

          {signing && (
            <>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Type your signature"
                className="w-full px-3 py-2 rounded border border-[#dc2626] bg-[#111] text-white mb-2"
              />
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#dc2626] bg-[#111] text-white"
              >
                <option value="cursive">Cursive</option>
                <option value="Great Vibes">Great Vibes</option>
                <option value="Pacifico">Pacifico</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Shadows Into Light">Shadows Into Light</option>
              </select>
              <button
                onClick={() => handleDrop(position)}
                className="mt-2 px-4 py-2 rounded bg-[#dc2626] text-white w-full hover:bg-red-700"
              >
                Save
              </button>
            </>
          )}

          {placedSignatures.length > 0 && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleFinalize}
                className="w-20 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
              >
                Accept
              </button>
              <button
                onClick={() => setShowRejectReason(true)}
                className="w-20 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectReason && (
        <div className="fixed top-24 left-4 right-4 max-w-sm mx-auto bg-black text-white border-2 border-[#dc2626] rounded-xl shadow-lg z-50 p-6">
          <h3 className="text-xl font-bold mb-2" style={{ textShadow: "0 0 6px #dc2626" }}>
            Reject Document
          </h3>
          <textarea
            className="w-full mb-4 p-3 bg-[#111] text-white border border-[#dc2626] rounded resize-none"
            placeholder="Enter reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => setShowRejectReason(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                await handleReject(rejectReason);
                setRejectReason("");
                setShowRejectReason(false);
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
