import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Plus, Calendar, Eye, ArrowLeft, User } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

const UserWorkspace = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pastes, setPastes] = useState([]);
  const [newPaste, setNewPaste] = useState({ title: "", content: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { error } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.toLowerCase())
          .single();

        if (error && error.code === 'PGRST116') {
          // User doesn't exist
          setUserExists(false);
        } else if (error) {
          throw error;
        } else {
          setUserExists(true);
          // Check if user is already authenticated in this session
          const isAuth = sessionStorage.getItem(`safenote_auth_${username.toLowerCase()}`);
          if (isAuth === 'true') {
            setIsAuthenticated(true);
            fetchUserPastes();
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        toast.error("Error checking user");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [username]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .eq('password', password)
        .single();

      if (error || !data) {
        toast.error("Invalid password");
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      // Store authentication in session storage for this workspace
      sessionStorage.setItem(`safenote_auth_${username.toLowerCase()}`, 'true');
      toast.success(`Welcome back, ${username}!`);
      fetchUserPastes();
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPastes = async () => {
    try {
      const { data, error } = await supabase
        .from('pastes')
        .select('*')
        .eq('username', username.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPastes(data || []);
    } catch (error) {
      console.error('Error fetching pastes:', error);
      toast.error("Failed to load pastes");
    }
  };

  const handleCreatePaste = async (e) => {
    e.preventDefault();
    
    if (!newPaste.title || !newPaste.content) {
      toast.error("Please fill in both title and content");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('pastes')
        .insert([{
          title: newPaste.title,
          content: newPaste.content,
          username: username.toLowerCase(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setPastes([data, ...pastes]);
      setNewPaste({ title: "", content: "" });
      setShowCreateForm(false);
      toast.success("Paste created successfully!");
    } catch (error) {
      console.error('Error creating paste:', error);
      toast.error("Failed to create paste");
    } finally {
      setLoading(false);
    }
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

  // User doesn't exist - show create option
  if (userExists === false) {
    return (
      <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
        <div className="max-w-md mx-auto">
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50 hover:text-white w-24 mb-4"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Create New Site?
              </CardTitle>
              <p className="text-slate-400 mt-2">
                Great! This site doesn&apos;t exist, it can be yours!
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-slate-300">Would you like to create:</p>
                <p className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  {username}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => navigate(`/${username}/create`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User exists but not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
        <div className="max-w-md mx-auto">
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50 hover:text-white w-24 mb-4"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Enter Password
              </CardTitle>
              <p className="text-slate-400 mt-2">
                Welcome to <span className="text-white font-semibold">{username}&apos;s</span> workspace
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to access this workspace"
                    className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {loading ? "Accessing..." : "Access Workspace"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User is authenticated - show workspace
  return (
    <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {username}&apos;s Workspace
          </h1>
          <p className="text-slate-400">
            Your private notes and messages - share this page with your password to give others access
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Plus className="mr-2 w-4 h-4" />
              {showCreateForm ? "Cancel" : "Create New Paste"}
            </Button>
            <Button
              onClick={() => {
                sessionStorage.removeItem(`safenote_auth_${username.toLowerCase()}`);
                setIsAuthenticated(false);
                toast.success("Logged out successfully");
              }}
              variant="outline"
              className="bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Create New Paste</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePaste} className="space-y-4">
                <Input
                  value={newPaste.title}
                  onChange={(e) => setNewPaste({ ...newPaste, title: e.target.value })}
                  placeholder="Enter paste title..."
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                  required
                />
                <textarea
                  value={newPaste.content}
                  onChange={(e) => setNewPaste({ ...newPaste, content: e.target.value })}
                  placeholder="Enter your content here..."
                  className="w-full min-h-[200px] p-4 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white resize-none"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {loading ? "Creating..." : "Create Paste"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Pastes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Recent Pastes</h2>
          {pastes.length === 0 ? (
            <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-xl">
              <CardContent className="text-center py-12">
                <p className="text-slate-400">No pastes yet. Create your first paste above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastes.map((paste) => (
                <Card key={paste.id} className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{paste.title}</h3>
                        <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                          {paste.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(paste.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate(`/paste/${paste.id}`)}
                        variant="outline"
                        size="sm"
                        className="bg-slate-700/50 text-white border-slate-600/50 hover:bg-slate-600/50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWorkspace;
