import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ArrowLeft, Check, Calendar, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchPasteById } from "../features/PasteThunks";
import { supabase } from "../lib/supabaseClient";

const ViewPaste = () => {
  const [copiedId, setCopiedId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { selectedPaste: paste, loading: pasteLoading, error } = useSelector((state) => state.paste);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      dispatch(fetchPasteById(id));
    }
  }, [dispatch, id]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!paste || !paste.username) {
      toast.error("Paste data not available");
      return;
    }

    setLoading(true);

    try {
      // Verify password for the paste's owner
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', paste.username)
        .eq('password', password)
        .single();

      if (error || !data) {
        toast.error("Invalid password");
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      toast.success("Access granted!");
    } catch (error) {
      console.error('Error verifying password:', error);
      toast.error("Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content) => {
    // Only allow copying if authenticated or if paste has no username (legacy)
    if (paste.username && !isAuthenticated) {
      toast.error("Please enter the password to copy this content");
      return;
    }
    
    navigator.clipboard.writeText(content);
    setCopiedId("textarea");
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (pasteLoading) {
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
          <p className="text-slate-400">The paste you&apos;re looking for doesn&apos;t exist or has been deleted</p>
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

  // Show password prompt if not authenticated and paste has a username (belongs to a workspace)
  if (paste.username && !isAuthenticated) {
    return (
      <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
        <div className="max-w-md mx-auto">
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Password Required</h2>
                  <p className="text-slate-400">
                    This paste belongs to <span className="text-white font-semibold">{paste.username}&apos;s</span> workspace
                  </p>
                  <p className="text-slate-400 text-sm">
                    Enter the workspace password to view this paste
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter workspace password"
                    className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                    required
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="flex-1 bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      {loading ? "Verifying..." : "Access"}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show the paste content if authenticated or if paste has no username (legacy pastes)
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
                {paste.username && (
                  <div className="text-slate-400 text-sm">
                    From <span className="text-white font-semibold">{paste.username}&apos;s</span> workspace
                  </div>
                )}
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
                {isAuthenticated && paste.username && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Lock className="w-4 h-4" />
                    Authenticated Access
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="relative">
                <Input
                  value={isAuthenticated || !paste.username ? paste.title : "Protected Content"}
                  disabled
                  className={`w-full bg-slate-900/50 border-slate-600/50 text-white text-lg font-semibold h-12 cursor-default focus:ring-0 ${
                    paste.username && !isAuthenticated ? 'select-none' : ''
                  }`}
                />
              </div>

              <div className="relative">
                <textarea
                  value={paste.content}
                  disabled
                  className={`w-full min-h-[200px] md:min-h-[400px] lg:min-h-[600px] p-6 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white text-medium leading-relaxed resize-none cursor-default focus:ring-0 ${
                    paste.username && !isAuthenticated ? 'select-none pointer-events-none blur-sm' : ''
                  }`}
                />
                {(isAuthenticated || !paste.username) && (
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
                )}
                {paste.username && !isAuthenticated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-slate-400 text-sm">Content is password protected</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewPaste;
