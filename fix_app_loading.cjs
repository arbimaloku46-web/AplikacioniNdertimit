const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

if (!code.includes("import { LoadingSpinner }")) {
  code = code.replace(
    "import { GlobalAuth } from './components/GlobalAuth';",
    "import { GlobalAuth } from './components/GlobalAuth';\nimport { LoadingSpinner } from './components/LoadingSpinner';"
  );
}

const oldAuthChecking = `  if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-white">
            <div className="mb-6 animate-pulse">
                <Logo className="h-16" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue mb-4"></div>
            <p className="text-slate-500 text-sm font-medium animate-pulse">Establishing Secure Connection...</p>
        </div>
      );
  }`;
const newAuthChecking = `  if (isAuthChecking) {
      return <LoadingSpinner message="Establishing Secure Connection..." fullScreen />;
  }`;
code = code.replace(oldAuthChecking, newAuthChecking);

const oldLoadingProjects = `                {loadingProjects ? (
                    <div className="flex items-center justify-center py-20"> 
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
                    </div>
                ) : (`;
const newLoadingProjects = `                {loadingProjects ? (
                    <LoadingSpinner message="Loading Projects..." />
                ) : (`;
code = code.replace(oldLoadingProjects, newLoadingProjects);

fs.writeFileSync('App.tsx', code);
