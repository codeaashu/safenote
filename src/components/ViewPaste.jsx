import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ArrowLeft, Check, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchPasteById } from "../features/PasteThunks";

const ViewPaste = () => {
  const [copiedId, setCopiedId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { selectedPaste: paste, loading, error } = useSelector((state) => state.paste);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      dispatch(fetchPasteById(id));
    }
  }, [dispatch, id]);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedId("textarea");
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Error Loading Paste</h2>
          <p className="text-slate-400">Please check if the paste ID is correct</p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (!paste) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Paste Not Found</h2>
          <p className="text-slate-400">The paste you're looking for doesn't exist or has been deleted</p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6 md:p-8">
            {/* Header */}
            <div className="space-y-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50 hover:text-white w-24"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient w-full text-center">
                View Paste
              </h1>

              {/* Metadata */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {paste.created_at ? new Date(paste.created_at).toDateString() : ''}

                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="relative">
                <Input
                  value={paste.title}
                  disabled
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white text-lg font-semibold h-12 cursor-default focus:ring-0"
                />
              </div>

              <div className="relative">
                <textarea
                  value={paste.content}
                  disabled
                  className="w-full min-h-[200px] md:min-h-[400px] lg:min-h-[600px] p-6 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white text-medium leading-relaxed resize-none cursor-default focus:ring-0"
                />
                <Button
                  className="absolute top-3 right-3 bg-slate-700/50 hover:bg-slate-600/50 text-white transition-all duration-300"
                  size="sm"
                  onClick={() => handleCopy(paste.content)}
                >
                  {copiedId === "textarea" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewPaste;
