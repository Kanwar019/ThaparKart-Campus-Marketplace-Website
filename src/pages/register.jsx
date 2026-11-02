import { useNavigate } from "react-router-dom";
import image1 from "../assets/image-1.png";
import BackButton from "../assets/icons/BackButton.svg";
import GoogleSignIn from "../components/GoogleSignIn.jsx";
import "../styles/Register.css";

export const Register = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between">
      {/* Background image with dimmer */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${image1})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Top Bar: Back button + ThaparKart logo */}
      <div className="w-[92%] max-w-[1300px] mx-auto pt-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="cursor-pointer transition-transform hover:scale-110 p-1"
            aria-label="Back"
          >
            <img src={BackButton} alt="Back" className="w-5 h-5 sm:w-6 sm:h-6 invert" />
          </button>

          <p className="font-subheading font-bold text-2xl sm:text-4xl md:text-5xl leading-none">
            <span className="text-[#ca0303]">Thapar</span>
            <span className="text-white">Kart</span>
          </p>
        </div>
      </div>

      {/* Centered register card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 z-10">
        <div className="w-full max-w-[540px] bg-[#141414e6] backdrop-blur-md rounded-3xl sm:rounded-[40px] border border-white/10 px-6 py-8 sm:px-10 sm:py-10 text-white shadow-2xl">
          <h1 className="font-subheading font-bold text-3xl sm:text-4xl text-center tracking-wide mb-6">
            Register
          </h1>

          <GoogleSignIn />

          {/* Already have account */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-5 mx-auto block text-center text-xs sm:text-sm text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            Already have an account? Login instead.
          </button>
        </div>
      </div>

      {/* Copyright */}
      <p className="py-4 text-white/80 text-xs text-center z-10">
        © 2025 ThaparKart | Campus Marketplace
      </p>
    </div>
  );
};

export default Register;
