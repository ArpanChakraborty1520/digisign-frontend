import { motion } from "framer-motion";
import Register from "./Register";
import Login from "./Login";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroImg from "../assets/hero.png"; // Replace with your image

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleRegistered = () => setShowLogin(true);
  const handleShowLogin = () => setShowLogin(true);
  const handleShowRegister = () => setShowLogin(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e0e] overflow-y-hidden text-white font-sans">
      <style>
        {`
          .red-shadow {
            text-shadow: 1px 1px 4px #ff0000;
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row w-full justify-center gap-2 flex-1">
        {/* Left Side - Image + Text */}
        <div className="left w-full md:w-[60%] flex flex-col items-center justify-center px-4 py-8">
          {/* Developer Illustration */}
          <img
            src={HeroImg}
            alt="Developer Illustration"
            className="w-[300px] md:w-[400px] mb-6 drop-shadow-xl"
          />

          {/* Welcome Heading */}
          <motion.h1
            className="flex flex-wrap md:flex-nowrap gap-2 justify-center text-4xl md:text-6xl font-extrabold text-center mb-4 md:whitespace-nowrap red-shadow"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-white">Welcome to</span>
            <span className="text-[#ff0000]">❤️Digisign.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.h2
            className="text-lg md:text-2xl text-[#ff0000] mb-8 text-center red-shadow"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Inkless. Effortless. Powerful.
          </motion.h2>
        </div>

        {/* Right Side - Register/Login */}
        <div className="right w-full md:w-[40%] flex mb-4 items-center justify-center px-4 py-8">
          {!showLogin ? (
            <Register
              onRegistered={handleRegistered}
              onShowLogin={handleShowLogin}
            />
          ) : (
            <Login onShowRegister={handleShowRegister} />
          )}
        </div>
      </div>
    </div>
  );
}
