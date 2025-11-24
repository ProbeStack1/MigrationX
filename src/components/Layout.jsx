import React from 'react';
import { useLocation } from 'react-router-dom';
import { Cloud, Layers } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-500 p-2.5 rounded-xl">
                  <Layers className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Apigee Migrator</h1>
                <p className="text-xs text-slate-500">Edge → Apigee X</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Demo Mode</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Apigee Edge to X Migration Tool</p>
              <p>Production-grade automation for API platform migrations</p>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Cloud className="w-4 h-4" />
              <span>Powered by GCP</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster position="top-right" expand={false} richColors />
    </div>
  );
}
