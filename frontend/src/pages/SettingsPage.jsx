import DashboardLayout from '../components/DashboardLayout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-[28px] font-extrabold text-white mb-2">Settings</h1>
        <p className="text-[15px] text-[#a1a1aa]">Manage your account preferences</p>
      </div>

      <div className="bg-[#1e1b4b] border border-[#7c3aed]/20 rounded-[20px] p-[32px] max-w-[800px]">
        <h2 className="text-[20px] font-bold text-white mb-6 border-b border-white/10 pb-4">Account Details</h2>
        
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[14px] text-[#a1a1aa] mb-2">Email Address</label>
            <input 
              type="email" 
              value="user@example.com" 
              disabled
              className="w-full bg-[#13111C] border border-white/10 rounded-[12px] px-4 py-3 text-white/50 cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block text-[14px] text-[#a1a1aa] mb-2">Change Password</label>
            <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[10px] px-6 py-2.5 text-[14px] transition-colors">
              Send Reset Link
            </button>
          </div>
        </div>

        <h2 className="text-[20px] font-bold text-white mt-12 mb-6 border-b border-white/10 pb-4">Preferences</h2>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium mb-1">Email Notifications</div>
              <div className="text-[#a1a1aa] text-[13px]">Receive updates about new features</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium mb-1">High Contrast Mode</div>
              <div className="text-[#a1a1aa] text-[13px]">Improve readability across the app</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
            </label>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
