import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Trash, Pencil, Share, Eye, Check, Calendar } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePaste } from "../features/PasteThunks";
import toast from "react-hot-toast";

const Paste = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [copiedId, setCopiedId] = useState(null);
	const dispatch = useDispatch();
	const pastes = useSelector((state) => state.paste.pastes);

	const filteredData = pastes.filter((paste) =>
		paste.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	function handleDelete(pasteId) {
		dispatch(deletePaste(pasteId));
	}

	function handleCopy(id, content) {
		navigator.clipboard.writeText(content);
		setCopiedId(id);
		toast.success("Content Copied to clipboard");
		setTimeout(() => setCopiedId(null), 2000);
	}

	function ShareMenu({ paste }) {
		const shareUrl = `${window.location.origin}/paste/${paste.id}`;
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
	}

	return (
		<div className="lg:w-5/12 h-[850px] rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl flex flex-col">
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
						key={paste?.id}
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
										{paste.created_at ? new Date(paste.created_at).toDateString() : ''}
									</p>
								</div>
								<div className="flex items-start gap-1">
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0 hover:text-yellow-400 transition-all duration-300"
									>
										<NavLink to={`/?pasteId=${paste?.id}`}>
											<Pencil className="w-4 h-4" />
										</NavLink>
									</Button>
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0 hover:text-red-700 transition-all duration-300"
										onClick={() => handleDelete(paste.id)}
									>
										<Trash className="w-4 h-4" />
									</Button>
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0 hover:text-orange-600 transition-all duration-300"
									>
										<NavLink to={`paste/${paste?.id}`}>
											<Eye className="w-4 h-4" />
										</NavLink>
									</Button>
									<ShareMenu paste={paste} />
									<Button
										size="sm"
										variant="ghost"
										className="h-8 w-8 p-0 hover:text-green-500 transition-all duration-300"
										onClick={() => handleCopy(paste.id, paste.content)}
									>
										{copiedId === paste.id ? (
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
	);
};

export default Paste;
