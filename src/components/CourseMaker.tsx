import React, { useState } from 'react';
import { BookOpen, Sparkles, Download, CheckCircle2, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { CourseData } from '../types';
import { generateFullCourse } from '../services/gemini';
import { executeGenerateAndDownloadPdf } from '../services/phoneController';

interface CourseMakerProps {
  onNotify: (msg: string) => void;
}

export const CourseMaker: React.FC<CourseMakerProps> = ({ onNotify }) => {
  const [topic, setTopic] = useState('Full Stack AI & Mobile App Development');
  const [level, setLevel] = useState('Beginner to Advanced');
  const [language, setLanguage] = useState<'Urdu' | 'English'>('English');
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);

  const handleGenerateCourse = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateFullCourse(topic, level, language);
      setCourse(result);
      onNotify(`Course "${result.title}" generated successfully by Gemini Pro!`);
    } catch (e: any) {
      console.error(e);
      onNotify(`Error generating course: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!course) return;
    const content = `Target Audience: ${course.targetAudience}\nEstimated Duration: ${course.duration}\nPrerequisites: ${course.prerequisites}\n\nConclusion:\n${course.conclusion}`;
    const modules = course.modules.map(m => ({
      title: m.title,
      summary: `${m.summary}\nPractical Exercise: ${m.practicalExercise}`,
      keyPoints: m.keyPoints
    }));

    const result = executeGenerateAndDownloadPdf(course.title, content, modules);
    if (result.success) {
      onNotify(`Course PDF downloaded: ${result.filename}`);
    }
  };

  return (
    <div className="sci-fi-box rounded-xl p-4 md:p-6 text-jarvis-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-jarvis-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-jarvis-cyan animate-pulse" />
          <h2 className="font-orbitron text-sm md:text-base font-bold text-cyan-200">
            GEMINI PRO COURSE ARCHITECT (کورس میکر)
          </h2>
        </div>
        <span className="text-[10px] font-mono-tech bg-purple-950/80 text-purple-300 px-2.5 py-1 rounded border border-purple-500/40">
          GEMINI-3.1-PRO
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4">
        Create masterclass courses and complete syllabuses on any topic with modules, practical exercises, and one-tap PDF export.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-mono-tech text-cyan-400 mb-1">
            COURSE TOPIC / موضوع
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Master React Native, Machine Learning in Urdu, Trading..."
            className="w-full bg-jarvis-surface border border-jarvis-border px-3 py-2 rounded text-sm text-cyan-100 focus:outline-none focus:border-jarvis-cyan"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-mono-tech text-cyan-400 mb-1">
              LEVEL / درجہ
            </label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full bg-jarvis-surface border border-jarvis-border px-2 py-2 rounded text-xs text-cyan-100 focus:outline-none focus:border-jarvis-cyan"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Beginner to Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono-tech text-cyan-400 mb-1">
              LANGUAGE / زبان
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="w-full bg-jarvis-surface border border-jarvis-border px-2 py-2 rounded text-xs text-cyan-100 focus:outline-none focus:border-jarvis-cyan"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Quick Topics */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[11px] text-cyan-500 font-mono-tech">Quick Skeletons:</span>
        {[
          'AI Agent Development with Gemini Pro',
          'Android App Development with Jetpack Compose',
          'Cyber Security & Ethical Hacking Basics',
          'Digital Marketing & Freelancing Masterclass',
          'Urdu Shairi & Adab (اردو شاعری اور ادب)'
        ].map(suggested => (
          <button
            key={suggested}
            onClick={() => setTopic(suggested)}
            className="text-[11px] bg-jarvis-surface/80 hover:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 text-cyan-300"
          >
            {suggested}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={handleGenerateCourse}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-jarvis-cyan to-jarvis-blue hover:from-cyan-400 hover:to-blue-600 text-black font-orbitron font-bold text-xs md:text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-cyan-glow disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>ARCHITECTING COURSE WITH GEMINI PRO...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-black" />
            <span>GENERATE COMPLETE COURSE (کورس بنائیں)</span>
          </>
        )}
      </button>

      {/* Render Generated Course */}
      {course && (
        <div className="mt-6 bg-jarvis-card/80 border border-jarvis-border rounded-lg p-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between border-b border-jarvis-border pb-3 mb-4 gap-2">
            <div>
              <h3 className="font-orbitron text-base font-bold text-cyan-200">
                {course.title}
              </h3>
              <div className="flex flex-wrap gap-2 text-xs text-cyan-400 mt-1 font-mono-tech">
                <span>Audience: {course.targetAudience}</span>
                <span>•</span>
                <span>Duration: {course.duration}</span>
              </div>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="bg-jarvis-cyan hover:bg-cyan-300 text-black font-orbitron font-bold text-xs py-1.5 px-3 rounded flex items-center gap-1.5 shadow-cyan-glow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT COURSE TO PDF</span>
            </button>
          </div>

          {/* Modules List */}
          <div className="space-y-3">
            {course.modules.map(module => (
              <div
                key={module.moduleNumber}
                className="bg-jarvis-surface p-3 rounded-lg border border-jarvis-border/60 hover:border-jarvis-cyan/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-jarvis-cyan/20 border border-jarvis-cyan text-jarvis-cyan text-xs font-mono-tech flex items-center justify-center font-bold">
                    {module.moduleNumber}
                  </span>
                  <h4 className="text-sm font-semibold text-cyan-100">
                    {module.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 mb-2 pl-7">
                  {module.summary}
                </p>

                {module.keyPoints && module.keyPoints.length > 0 && (
                  <div className="pl-7 space-y-1 mb-2">
                    {module.keyPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-cyan-300/80">
                        <ChevronRight className="w-3 h-3 text-jarvis-cyan flex-shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {module.practicalExercise && (
                  <div className="ml-7 bg-jarvis-card p-2 rounded border border-cyan-900/60 text-xs text-amber-200/90 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-jarvis-amber flex-shrink-0 mt-0.5" />
                    <span><strong className="text-jarvis-amber">Practical Task:</strong> {module.practicalExercise}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Conclusion */}
          {course.conclusion && (
            <div className="mt-4 p-3 bg-jarvis-surface rounded border border-jarvis-border text-xs text-slate-300">
              <span className="font-mono-tech text-cyan-400 font-bold block mb-1">SUMMARY & NEXT STEPS:</span>
              {course.conclusion}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
