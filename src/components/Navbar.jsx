import React from "react";
import { Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="min-h-[5vh] bg-gradient-to-b from-background to-muted">
      <nav className="container mx-auto">
        <div className="flex justify-between items-center">
          <NavLink
            to="/"
            className="flex items-center"
          >
            <img 
              src="/wordmark.png" 
              alt="SafeNote Logo" 
              className="h-8"
            />
          </NavLink>
          <div className="flex items-center gap-6">
            <NavLink
              to="https://twitter.com/warrior_aashuu"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-300 ease-in-out"
            >
              <Button
                variant="ghost"
                size="icon"
                className="!p-0 hover:bg-slate-500 hover:bg-opacity-20 rounded-full transition duration-300 ease-in-out"
              >
                <Twitter className="!h-6 !w-6 text-slate-100 hover:text-blue-500 transition duration-300 ease-in-out" />
              </Button>
            </NavLink>

            <NavLink
              to="https://github.com/codeaashu"
              target="_blank"
              rel="noopener noreferrer"
              className="transition duration-300 ease-in-out"
            >
              <Button
                variant="ghost"
                size="icon"
                className="!p-0 hover:bg-slate-500 hover:bg-opacity-20 rounded-full transition duration-300 ease-in-out"
              >
                <Github className="!h-6 !w-6 text-slate-100 hover:text-slate-500 transition duration-300 ease-in-out" />
              </Button>
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
