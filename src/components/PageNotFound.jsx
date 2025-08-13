import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex items-center justify-center flex-col text-center">
      <p className="font-mono text-2xl md:text-2xl">404 | Page Not Found</p>
      <br />
      <Button
        variant="outline"
        onClick={() => navigate("/")}
        className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50 hover:text-white w-24 mt-4"
      >
        <ArrowLeft className="mr-2 w-4 h-4" /> Back
      </Button>
    </div>
  );
};

export default PageNotFound;
