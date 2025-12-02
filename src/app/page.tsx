import fs from 'fs';
import path from 'path';
import { Chapter } from '@/lib/types';
import ChapterCard from '@/components/ChapterCard';

async function getChapters(): Promise<Chapter[]> {
  const filePath = path.join((process as any).cwd(), 'data', 'modern_chapters.json');
  // Handle case where file might not exist in build env before scripts run
  if (!fs.existsSync(filePath)) return [];
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

export default async function Home() {
  const chapters = await getChapters();

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative bg-danube-950 text-white py-24 px-6 mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.gutenberg.org/files/11484/11484-h/images/cover.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay blur-sm"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
            Le Pilote du Danube
          </h1>
          <p className="text-xl md:text-2xl text-danube-200 font-light max-w-2xl mx-auto">
            A modern, interactive journey through Jules Verne's river adventure.
            <br/>
            <span className="text-sm mt-4 block opacity-70">Rewritten in 2025 French • Interactive Translation • Immersive Audio</span>
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 font-serif">Table of Contents</h2>
          <span className="text-sm text-gray-500">{chapters.length} Chapters</span>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-lg text-gray-500">
              Chapters not loaded. Please run the Python setup scripts to generate content.
            </p>
            <code className="block mt-4 bg-gray-200 p-2 rounded max-w-sm mx-auto text-sm">
              npm run download && npm run split && npm run modernize
            </code>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}