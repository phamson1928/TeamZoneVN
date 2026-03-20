import React from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Toaster } from 'sonner';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        // Apple-style: off-white background, like macOS Ventura/Sonoma desktop
        <div className="min-h-screen bg-[#ECECEC] text-gray-900 font-sans selection:bg-gray-800/10 flex">
            <Sidebar />
            {/* Content area offset to the right of the floating sidebar */}
            <div className="lg:pl-[252px] flex flex-col flex-1 min-w-0">
                <TopHeader />
                <main className="flex-1 p-4 pt-4 overflow-y-auto w-full">
                    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="bottom-right" theme="light" closeButton richColors />
        </div>
    );
};
