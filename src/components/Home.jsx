const Home = () => {
  return (
    <div className="w-full p-4 md:p-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Call to Action */}
                {/* Welcome Section */}
        {/* <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome to SafeNote
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Create your own private workspace to store and share your notes securely. 
            No signup required – just pick a username and password!
          </p>
        </div> */}

        {/* How it Works */}
        {/* <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-blue-400">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Choose Username</h3>
            <p className="text-slate-400">
              Enter any username in the URL like safenote.vercel.app/yourname
            </p>
          </div> */}
          
          {/* <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-400">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Set Password</h3>
            <p className="text-slate-400">
              Create a secure password to protect your private workspace
            </p>
          </div> */}
          
          {/* <div className="space-y-4">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-pink-400">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white">Start Creating</h3>
            <p className="text-slate-400">
              Create and manage your private notes in your secure workspace
            </p>
          </div>
        </div> */}
        <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">F*ck Authentication</h2>
          <p className="text-slate-400 mb-4">
            No Logins. No Signups. Just secure & shareable notes!
          </p>
          <p className="text-sm text-slate-500">
            Even SafeNote Can’t See Your Notes. Your data is fully encrypted and only accessible by you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
