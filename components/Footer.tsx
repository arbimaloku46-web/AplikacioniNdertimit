import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-brand-blue font-bold">N</div>
               <span className="font-display font-bold text-white text-xl">Shiko Progresin</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Elevating construction monitoring with state-of-the-art drone cinematography and 3D Gaussian Splat technology. We bring the job site to your screen, anywhere in the world.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400">
              <li>projekti@ndertimi.org</li>
              <li>+355 68 477 8194</li>
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
          <p className="text-slate-600 text-sm">© 2024 Shiko Progresin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};