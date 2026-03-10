import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LayoutDashboard, Users, Settings, Bell, Search, Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30 selection:text-white">
    {/* Sidebar for desktop */}
    <div className="hidden lg:flex flex-col w-64 fixed inset-y-0 border-r border-zinc-800 bg-zinc-950">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">GameZone</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-900 text-indigo-400 font-medium transition-all">
          <LayoutDashboard className="h-5 w-5" /> Dashboard
        </Link>
        <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all">
          <Users className="h-5 w-5" /> Users
        </Link>
        <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all">
          <Settings className="h-5 w-5" /> Settings
        </Link>
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-400">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-zinc-500 truncate">admin@gamezone.vn</p>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="lg:pl-64 flex flex-col min-h-screen">
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search analytics..."
            className="w-full bg-zinc-900 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-600 outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-indigo-500 rounded-full border-2 border-zinc-950" />
          </button>
          <button className="lg:hidden p-2 text-zinc-400">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
    <Toaster position="bottom-right" theme="dark" closeButton richColors />
  </div>
);

const Home = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-zinc-400 mt-1">Welcome back. Here's what's happening today.</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
        Export Data <ExternalLink className="h-4 w-4" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {[
        { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', trend: 'up' },
        { label: 'Active Users', value: '+2350', change: '+180.1%', trend: 'up' },
        { label: 'Games Played', value: '+12,234', change: '+19%', trend: 'up' },
        { label: 'Server Load', value: '42.3%', change: '-4.2%', trend: 'down' },
      ].map((stat, i) => (
        <div key={i} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <LayoutDashboard className="h-12 w-12" />
          </div>
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</h3>
          <p className="text-3xl font-bold mt-2 font-mono tracking-tight">{stat.value}</p>
          <p className={cn(
            "text-xs mt-2 font-medium flex items-center gap-1",
            stat.trend === 'up' ? "text-emerald-500" : "text-rose-500"
          )}>
            {stat.change} <span className="text-zinc-600 font-normal">from last month</span>
          </p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 p-8 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
          <LayoutDashboard className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold">Chart Integration Ready</h3>
        <p className="text-zinc-400 max-w-sm">
          Recharts is installed and ready. You can start visualizing your data here.
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700">
            View API Docs
          </button>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
        <h3 className="text-lg font-bold">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-zinc-500">2 minutes ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
