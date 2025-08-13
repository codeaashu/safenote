import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Trash, Pencil, Share, Eye, Check, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSearchParams, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  addToPaste,
  removeFromPaste,
  updateToPaste,
} from "../features/PasteSlice";
import toast from "react-hot-toast";

const Home = () => {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [searchParam, setSearchParam] = useSearchParams();
  const pasteId = searchParam.get("pasteId");
  const [copiedId, setCopiedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const allPastes = useSelector((state) => state.paste.pastes);
  const dispatch = useDispatch();

  useEffect(() => {
    if (pasteId) {
      const paste = allPastes.find((p) => p._id === pasteId);
      if (paste) {
        setTitle(paste.title);
        setValue(paste.content);
      }
    }
  }, [pasteId, allPastes]);

  function createPaste() {
    if (!title.trim() || !value.trim()) {
      toast.error("Title and content are required!");
      return;
    }

    const paste = {
      title: title,
      content: value,
      _id: pasteId || Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };

    if (pasteId) {
      dispatch(updateToPaste(paste));
    } else {
      dispatch(addToPaste(paste));
    }

    setTitle("");
    setValue("");
    setSearchParam({});
  }

  const ShareMenu = ({ paste }) => {
    const shareUrl = `${window.location.origin}/paste/${paste._id}`;
    const copyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    };

    return (
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:text-blue-700 transition-all duration-300"
        onClick={copyToClipboard}
      >
        <Share className="w-4 h-4" />
      </Button>
    );
  };

  const handleCopy = (pasteId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(pasteId);
    toast.success("Content Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (pasteId) => {
    setDeleteId(pasteId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      dispatch(removeFromPaste(deleteId));
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const pastes = useSelector((state) => state.paste.pastes);

  const filteredData = [...pastes]
    .sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .filter((paste) =>
      paste.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Card */}
          <div className="flex-1 rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <div className="p-6 md:p-8">
              <div className="text-center space-y-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  Start Your New Paste
                </h1>
                <p className="text-slate-400 text-medium">
                  Capture your ideas, tasks, and notes effortlessly.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Enter title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900/50 border-slate-600/50 text-white placeholder-slate-400 hover:border-blue-400 transition-all duration-300 h-12 text-medium"
                  />
                  <Button
                    onClick={createPaste}
                    className={`h-12 ${
                      pasteId
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white font-medium sm:p-5 rounded-lg transition-all duration-300 shadow-lg`}
                  >
                    {pasteId ? "Update Paste" : "Create Paste"}
                  </Button>
                </div>

                <div className="relative group">
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full h-[600px] p-6 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 resize-none text-medium leading-relaxed hover:border-blue-400 transition-all duration-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    placeholder="Paste your content here..."
                  />
                  <Button
                    className="absolute top-3 right-3 bg-slate-700/50  hover:bg-slate-600/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                    size="sm"
                    onClick={() => handleCopy("textarea", value)}
                  >
                    {copiedId === "textarea" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="lg:w-5/12 h-[850px] rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 md:p-8 flex-none">
              <div className="text-center space-y-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  Your Recent Pastes
                </h1>
                <p className="text-slate-400 text-medium">
                  Enjoy Quick access to your pastes.
                </p>
              </div>

              <Input
                placeholder="Search Paste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border-slate-600/50 text-white placeholder-slate-400 hover:border-blue-400 transition-all duration-300 h-12 text-medium"
              />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/50">
              {filteredData.map((paste) => (
                <Card
                  key={paste?._id}
                  className="bg-slate-900/50 border-slate-700/50 hover:border-blue-400 transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex place-items-start justify-between flex-col">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-medium">
                          {paste.title}
                        </h3>
                        <p className="text-sm  text-slate-400 mt-1">
                          {paste.content}
                        </p>
                        <p className="text-xs flex items-center gap-2 text-slate-400 mt-1">
                  <Calendar className="w-4 h-4" />

                          {new Date(paste.createdAt).toDateString()}
                        </p>
                      </div>
                      <div className="flex items-start gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-yellow-400 transition-all duration-300"
                        >
                          <NavLink to={`/?pasteId=${paste?._id}`}>
                            <Pencil className="w-4 h-4" />
                          </NavLink>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-red-700 transition-all duration-300"
                          onClick={() => handleDelete(paste._id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-orange-600 transition-all duration-300"
                        >
                          <NavLink to={`paste/${paste?._id}`}>
                            <Eye className="w-4 h-4" />
                          </NavLink>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-blue-700 transition-all duration-300"
                        >
                          <ShareMenu paste={paste} />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-green-500 transition-all duration-300"
                          onClick={() => handleCopy(paste._id, paste.content)}
                        >
                          {copiedId === paste._id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete btn */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border border-slate-900 shadow-xl w-[90%] md:w-[500px] max-w-lg mx-auto p-6 rounded-lg">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-lg md:text-xl text-center text-white font-semibold">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm md:text-base text-center text-slate-400">
              This action cannot be undone. This will permanently delete your
              paste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:space-x-3 mt-4 sm:justify-center">
            <AlertDialogCancel className="w-full sm:w-auto bg-slate-900 text-white border border-slate-700 rounded-md hover:bg-slate-800 transition-all duration-300 text-sm md:text-base py-2 px-4">
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="w-full sm:w-auto bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-300 text-sm md:text-base py-2 px-4"
            >
              Yes, delete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
