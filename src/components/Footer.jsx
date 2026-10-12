// src/components/Footer.jsx
import React from "react";
import divider from "../assets/divider.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

export const Footer = () => {
  return (
    <footer className="bg-white py-10 relative">
      {/* Divider */}
      <img
        className="w-[calc(100%_-_160px)] max-w-[1200px] mx-auto top-0 left-0 right-0 h-px object-cover absolute inset-x-0"
        alt="Divider"
        src={divider}
      />

      <div className="w-[90%] mx-auto flex items-center justify-between pt-4">
        {/* Footer logo */}
        <p className="h-9 flex items-center justify-center font-subheading text-[length:var(--subheading-font-size)]">
          <span className="text-[#c90202] font-subheading">Thapar</span>
          <span className="text-black font-subheading">Kart</span>
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-3">
          <img
            src={facebookIcon}
            alt="facebook"
            className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          />
          <img
            src={instagramIcon}
            alt="instagram"
            className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          />
          <img
            src={linkedinIcon}
            alt="linkedin"
            className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          />
          <img
            src={youtubeIcon}
            alt="youtube"
            className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
