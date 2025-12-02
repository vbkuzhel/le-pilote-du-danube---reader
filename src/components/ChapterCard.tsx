import Link from 'next/link';
import Image from 'next/image';
import { Chapter } from '@/lib/types';

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  // Logic to handle image placeholder if generated image is missing
  // In production, users would run the scripts to generate ./public/images/chapterX.png
  const imagePath = `/images/chapter${chapter.id}.png`;

  return (
    <Link href={`/chapter/${chapter.id}`} className="group block">
      <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-danube-100 dark:border-slate-700 h-full flex flex-col">
        <div className="relative h-48 w-full overflow-hidden bg-danube-900">
           {/* Fallback styling if image missing, or actual image */}
           <div className="absolute inset-0 flex items-center justify-center text-danube-200 opacity-20 text-6xl font-serif font-bold">
             {chapter.id}
           </div>
           <Image 
             src={imagePath}
             alt={`Illustration for Chapter ${chapter.id}`}
             fill
             className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
             onError={(e) => {
                 // Fallback if file doesn't exist yet
                 (e.target as HTMLImageElement).style.display = 'none';
             }}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
           <div className="absolute bottom-4 left-4 text-white">
             <span className="text-xs font-bold uppercase tracking-widest text-danube-300">Chapitre {chapter.id}</span>
           </div>
        </div>
        <div className="p-6 flex-grow">
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100 group-hover:text-danube-600 transition-colors">
            {chapter.original_title}
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
             {/* Preview text */}
             {chapter.modern_content.substring(0, 120)}...
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700">
            <span className="text-sm font-semibold text-danube-600 group-hover:underline">Lire le chapitre &rarr;</span>
        </div>
      </div>
    </Link>
  );
}