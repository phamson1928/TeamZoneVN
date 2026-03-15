import React from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Toaster } from 'sonner';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 flex">
            <Sidebar />
            <div className="lg:pl-[260px] flex flex-col flex-1 min-w-0">
                <TopHeader />
                <main className="flex-1 p-6 lg:p-8 xl:p-10 overflow-y-auto w-full">
                    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="bottom-right" theme="light" closeButton richColors className="shadow-2xl" />
        </div>
    );
};
