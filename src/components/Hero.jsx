import { ArrowRight, Users, Lock, Share } from "lucide-react";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { track } from '@vercel/analytics';

const Hero = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleGoToWorkspace = () => {
    if (!username.trim()) {
      return;
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    
    // Track username search event
    track('username_search', {
      username: cleanUsername
    });
    
    navigate(`/${cleanUsername}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoToWorkspace();
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
        {/* The Most Secure Way to Save and Share Your Private Notes & Messages! */}
        The Safest Way to Store and Share Your Private Notes & Messages!
      </h1>

      <p className="text-xl md:text-xl text-muted-foreground mb-8">
        Create your own private workspace with just a username and password.
      </p>

      {/* Quick Access */}
      <div className="max-w-md mx-auto mb-12 space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-400"
          />
          <Button
            onClick={handleGoToWorkspace}
            disabled={!username.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
          >
            Go
          </Button>
        </div>
        <p className="text-sm text-slate-400">
          Don&apos;t have a workspace? Just enter any username to create one!
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Username Based</h3>
          <p className="text-slate-400 text-sm">
            No email or number required. Just pick a username and you&apos;re ready to go!
          </p>
        </div>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Password Protected</h3>
          <p className="text-slate-400 text-sm">
            Your notes are secured with your own password. Only you have access.
          </p>
        </div>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto">
            <Share className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Easy Sharing</h3>
          <p className="text-slate-400 text-sm">
            Share your workspace URL and password with anyone you trust.
          </p>
        </div>
      </div>

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
