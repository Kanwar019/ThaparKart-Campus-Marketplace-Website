import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import image11 from "../assets/image-11.png";
import image12 from "../assets/image-12.png";
import image13 from "../assets/image-13.png";
import image14 from "../assets/image-14.png";
import image15 from "../assets/image-15.png";
import image16 from "../assets/image-16.png";

import "../styles/article.css";

export const Article = ({ loggedIn }) => {
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);

  return (
    <div className="bg-white dark:bg-[#121212] min-h-screen flex flex-col text-gray-900 dark:text-neutral-100 transition-colors">
      {/* TOP NAV */}
      <Header loggedIn={isLogged} showBack={true} onBack={() => navigate(isLogged ? "/landing-login" : "/landing")} />

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* Article hero + heading */}
        <section className="w-[92%] sm:w-[90%] max-w-6xl mx-auto pt-6 sm:pt-10 pb-10 sm:pb-16">
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Heading + intro */}
            <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl">
              {/* HEADING */}
              <h1 className="font-title font-bold text-[28px] sm:text-[38px] lg:text-[48px] leading-tight sm:leading-snug">
                <span className="text-black dark:text-white">
                  Making Sustainability a Habit: How{" "}
                </span>
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-black dark:text-white">
                  {" "}
                  Kart Helps Students Go Green
                </span>
              </h1>

              <p className="font-subheading text-base sm:text-lg text-[#000000bf] dark:text-neutral-300">
                Small steps towards sustainability can create a big impact — see
                how ThaparKart encourages Thapar students to reduce waste
                through reuse.
              </p>
            </div>

            {/* Hero image */}
            <div
              className="w-full h-[220px] sm:h-[360px] md:h-[480px] lg:h-[600px] rounded-2xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: `url(${image15})` }}
            />
          </div>
        </section>

        {/* Article body – first text block */}
        <section className="w-[92%] sm:w-[90%] max-w-6xl mx-auto pb-10 sm:pb-16">
          <div className="text-[16px] sm:text-[18px] md:text-[20px] leading-[1.8] text-gray-800 dark:text-neutral-200 font-small text-left sm:text-justify space-y-6">
            <p>
              At ThaparKart, we believe that one student’s unused item can be another’s perfect find. 
              By promoting buying and selling within campus, we reduce unnecessary waste and 
              encourage a circular economy.
            </p>

            <p>
              From cycle resales to book exchanges, every transaction on ThaparKart saves resources 
              that would otherwise go unused. It’s not just about saving money — it’s about being 
              mindful of what we own and how we share it.
            </p>

            <p>
              Every product listed tells a story — a laptop that found a new home, a set of notes 
              passed on to help someone score better, or a hostel chair reused instead of being 
              discarded. Each small action contributes to a greener Thapar campus.
            </p>

            <p>
              As a student-run initiative, ThaparKart aims to empower students to make sustainable 
              choices effortlessly while keeping convenience and affordability at the forefront.
            </p>
          </div>
        </section>

        {/* Two side images */}
        <section className="w-[92%] sm:w-[90%] max-w-6xl mx-auto pb-10 sm:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div
              className="w-full h-[220px] sm:h-[300px] md:h-[380px] rounded-2xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
              style={{ backgroundImage: `url(${image14})` }}
            />
            <div
              className="w-full h-[220px] sm:h-[300px] md:h-[380px] rounded-2xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
              style={{ backgroundImage: `url(${image16})` }}
            />
          </div>
        </section>

        {/* Second text block */}
        <section className="w-[92%] sm:w-[90%] max-w-6xl mx-auto pb-10 sm:pb-16">
          <div className="text-[16px] sm:text-[18px] md:text-[20px] leading-[1.8] text-gray-800 dark:text-neutral-200 font-small text-left sm:text-justify space-y-6">
            <p>
              ThaparKart is more than just a campus marketplace — it’s a community built by students, 
              for students. Whether you’re looking for affordable textbooks, a cycle to commute, or 
              decor for your hostel room.
            </p>

            <p>
              ThaparKart connects buyers and sellers across the Thapar campus safely and easily. Every 
              listing you browse or post contributes to a more sustainable and connected student 
              community.
            </p>
          </div>
        </section>

        {/* You May Also Like */}
        <section className="w-[92%] sm:w-[90%] max-w-6xl mx-auto pb-16 md:pb-20">
          <h2 className="font-heading text-[22px] sm:text-[28px] lg:text-[32px] text-black dark:text-white mb-6">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="flex flex-col items-start gap-3 sm:gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-full h-[200px] sm:h-[240px] rounded-xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] overflow-hidden bg-[#f7f7f7] dark:bg-neutral-800">
                <img
                  src={image11}
                  alt="5 Smart Ways to Reuse and Save on Campus"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-body-text font-semibold text-black dark:text-white">
                  5 Smart Ways to Reuse and Save on Campus
                </p>
                <p className="font-body-text text-sm text-[#828282] dark:text-neutral-400 mt-1">
                  ThaparKart Editorial Team
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-start gap-3 sm:gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-full h-[200px] sm:h-[240px] rounded-xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] overflow-hidden bg-[#f7f7f7] dark:bg-neutral-800">
                <img
                  src={image12}
                  alt="Student Success Stories"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-body-text font-semibold text-black dark:text-white">
                  Student Success Stories: How I Earned ₹2000 from My Old Books
                </p>
                <p className="font-body-text text-sm text-[#828282] dark:text-neutral-400 mt-1">Rohan Gupta</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-start gap-3 sm:gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-full h-[200px] sm:h-[240px] rounded-xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] overflow-hidden bg-[#f7f7f7] dark:bg-neutral-800">
                <img
                  src={image13}
                  alt="Inside ThaparKart"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-body-text font-semibold text-black dark:text-white">
                  Inside ThaparKart: Building the Campus Marketplace Together
                </p>
                <p className="font-body-text text-sm text-[#828282] dark:text-neutral-400 mt-1">
                  ThaparKart Team
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export const ArticleWithLogin = (props) => <Article loggedIn={true} {...props} />;

export default Article;
