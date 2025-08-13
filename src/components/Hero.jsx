import { ArrowRight } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

const Hero = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
        Save Everything You Love, Effortlessly!
      </h1>

      <p className="text-xl md:text-xl text-muted-foreground mb-8">
        Organize your notes, code snippets, and links in one place. Boost your
        productivity and start saving today!
      </p>

      <div className="flex justify-center">
        <NavLink
          to="https://github.com/codeaashu/safenote"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-full border border-transparent hover:border-white transition-all duration-300">
            Star this project ⭐
            <ArrowRight className="w-4 h-4" />
            <span className="inline-block transition-transform group-hover:translate-x-1"></span>
          </button>
        </NavLink>
      </div>
    </div>
  );
};

export default Hero;
