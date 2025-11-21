import React from 'react';

interface FooterProps {
  isAdmin: boolean;
  onToggleAdmin: (value: boolean) => void;
}

export const Footer: React.FC<FooterProps> = ({ isAdmin, onToggleAdmin }) => {
  return (
    <footer id="contact" className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-black font-bold">N</div>
               <span className="font-display font-bold text-white text-xl">NDËRTIMI</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Elevating construction monitoring with state-of-the-art drone cinematography and 3D Gaussian Splat technology. We bring the job site to your screen, anywhere in the world.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400">
              <li>info@ndertimi.com</li>
              <li>+355 4 222 3333</li>
              <li>Tirana, Albania</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Client Access</h4>
            <p className="text-slate-500 text-sm mb-4">
              Already a client? Find your project in the portfolio section and enter your access code.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">© 2024 Ndërtimi. All rights reserved.</p>
          
          {/* Admin Toggle - Subtle for the user */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-700 uppercase font-bold cursor-pointer hover:text-slate-500 transition-colors">
               <input 
                 type="checkbox" 
                 checked={isAdmin}
                 onChange={(e) => onToggleAdmin(e.target.checked)}
                 className="mr-2 accent-amber-500"
               />
               Admin Mode
            </label>
          </div>
        </div>
      </div>
    </footer>
  );
};