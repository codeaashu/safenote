import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

const CreateWorkspace = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user:', checkError);
        toast.error("Error checking username availability");
        setLoading(false);
        return;
      }

      if (existingUser) {
        toast.error("This username is already taken");
        setLoading(false);
        return;
      }

      // Create new user workspace
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: username.toLowerCase(),
          password: password,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('User created successfully:', data);
      toast.success("Workspace created successfully!");
      navigate(`/${username}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error(`Failed to create workspace: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
              Create New Workspace
            </CardTitle>
            <p className="text-slate-400 mt-2">
              Great! This site doesn&apos;t exist, it can be yours!
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                <Input
                  value={username || ""}
                  disabled
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                  required
                />
              </div>

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
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateWorkspace;
