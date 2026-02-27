import React from 'react';
import { MenuIcon, BellIcon, SearchIcon } from 'lucide-react';
export function Header({ title, onMenuClick }) {
    return (<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="mr-4 text-slate-500 hover:text-slate-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1">

          <MenuIcon className="w-6 h-6"/>
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search (hidden on mobile) */}
        <div className="hidden md:flex relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-slate-400"/>
          </div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" placeholder="Quick search..."/>

        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"/>
          <BellIcon className="h-6 w-6"/>
        </button>

        {/* User Dropdown (Static) */}
        <div className="relative flex items-center cursor-pointer">
          <img className="h-8 w-8 rounded-full object-cover border border-slate-200" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User avatar"/>

        </div>
      </div>
    </header>);
}
