import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import ChapterReader from '@/components/ChapterReader';
import { Chapter } from '@/lib/types';

// Generate static params for all 18 chapters
export async function generateStaticParams() {
  const filePath = path.join((process as any).cwd(), 'data', 'modern_chapters.json');
  if (!fs.existsSync(filePath)) return [];
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const chapters: Chapter[] = JSON.parse(jsonData);
  
  return chapters.map((chapter) => ({
    id: chapter.id.toString(),
  }));
}

async function getChapter(id: string): Promise<Chapter | null> {
  const filePath = path.join((process as any).cwd(), 'data', 'modern_chapters.json');
  if (!fs.existsSync(filePath)) return null;
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const chapters: Chapter[] = JSON.parse(jsonData);
  return chapters.find((c) => c.id === parseInt(id)) || null;
}

export default async function ChapterPage({ params }: { params: { id: string } }) {
    // Await params as per Next.js 15 breaking change requirements if strict mode is on, 
    // but standard page props usually work. Safe access:
    const { id } = await params; 
    const chapter = await getChapter(id);

    if (!chapter) {
        notFound();
    }

    const nextId = chapter.id < 18 ? chapter.id + 1 : null;
    const prevId = chapter.id > 1 ? chapter.id - 1 : null;

    return (
        <div className="min-h-screen bg-paper dark:bg-slate-900 pb-24">
            {/* Header / Nav */}
            <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-danube-700 hover:text-danube-900 dark:text-danube-400 flex items-center gap-2">
                        <Home size={20} />
                        <span className="font-bold hidden sm:inline">Le Pilote du Danube</span>
                    </Link>
                    <span className="font-serif font-bold text-lg text-gray-800 dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">
                        Chapter {chapter.id}
                    </span>
                    <div className="flex gap-2">
                        {prevId ? (
                            <Link href={`/chapter/${prevId}`} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-gray-300">
                                <ChevronLeft size={24} />
                            </Link>
                        ) : <div className="w-10" />}
                        {nextId ? (
                            <Link href={`/chapter/${nextId}`} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-gray-300">
                                <ChevronRight size={24} />
                            </Link>
                        ) : <div className="w-10" />}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-6 mt-8">
                {/* Illustration */}
                <div className="relative w-full aspect-[16/10] mb-12 rounded-lg overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
                    <div className="absolute inset-0 bg-danube-900 animate-pulse" /> {/* Placeholder */}
                    <Image
                        src={`/images/chapter${chapter.id}.png`}
                        alt={`Illustration for ${chapter.original_title}`}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-24">
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-md">
                            {chapter.original_title}
                        </h1>
                    </div>
                </div>

                {/* Text */}
                <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-p:font-serif prose-p:text-gray-800 dark:prose-p:text-gray-300 max-w-none">
                    <ChapterReader content={chapter.modern_content} />
                </div>
            </article>

            {/* Bottom Nav */}
            <div className="max-w-3xl mx-auto px-6 mt-16 flex justify-between items-center border-t border-gray-200 dark:border-slate-800 pt-8">
                {prevId ? (
                     <Link href={`/chapter/${prevId}`} className="flex flex-col items-start group">
                        <span className="text-sm text-gray-400 mb-1">Previous</span>
                        <span className="font-serif font-bold text-lg text-danube-600 group-hover:underline">Chapter {prevId}</span>
                     </Link>
                ) : <div />}

                {nextId ? (
                     <Link href={`/chapter/${nextId}`} className="flex flex-col items-end group">
                        <span className="text-sm text-gray-400 mb-1">Next</span>
                        <span className="font-serif font-bold text-lg text-danube-600 group-hover:underline">Chapter {nextId}</span>
                     </Link>
                ) : <div />}
            </div>
        </div>
    );
}