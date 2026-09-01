const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// Just remove the tiny spinner inside the image and add a modal overlay spinner
const oldSpinner = `{isUploadingThumbnail && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                                                    <div className="w-6 h-6 border-2 border-white/30 border-t-brand-blue rounded-full animate-spin" />
                                                </div>
                                            )}`;
const newSpinner = `{isUploadingThumbnail && (
                                                <div className="absolute inset-0 bg-black/60 z-10 backdrop-blur-sm" />
                                            )}`;

code = code.replace(oldSpinner, newSpinner);

const modalContentRegex = /<div className="w-full max-w-2xl bg-slate-900 border border-white\/10 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col max-h-\[90vh\]">/;
const newModalContent = `<div className="w-full max-w-2xl bg-slate-900 border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col max-h-[90vh] relative overflow-hidden">
             {isUploadingThumbnail && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center">
                    <LoadingSpinner message="Uploading Thumbnail..." />
                </div>
             )}`;

code = code.replace(modalContentRegex, newModalContent);

fs.writeFileSync('App.tsx', code);
