import React from "react";
// import Logo from "../assets/Logo.jpeg";

export default function Navbar() {
  return (
    <nav
      className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg flex justify-center items-center h-16 px-6 rounded-b-xl"
      style={{
        fontFamily: "'Poppins', sans-serif",
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 20px rgba(255, 0, 0, 0.1)", // subtle red glow
      }}
    >
      <div className="flex items-center gap-4">
        {/* Uncomment this to use logo */}
        {/* <img className="w-10 h-10 rounded-full" src={Logo} alt="Logo" /> */}
        <span
          className="text-white text-2xl font-semibold tracking-wide"
          style={{
            textShadow: "0 0 8px red", // glowing red shadow
          }}
        >
          ❤️DigiSign
        </span>
      </div>
    </nav>
  );
}
