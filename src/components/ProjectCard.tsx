import React, { useState } from 'react';
import {
  ExternalLink,
  Presentation,
  Globe,
  User,
  GraduationCap,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AssignmentSubmission } from '../types/assignment';
import { getFacultyBadgeStyle } from '../utils/submissionUtils';
import { getFallbackThumbnailUrl, extractHostname } from '../utils/thumbnail';

interface ProjectCardProps {
  submission: AssignmentSubmission;
  onPreview: (submission: AssignmentSubmission) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  submission,
  onPreview,
}) => {
  const [imgError, setImgError] = useState(false);
  const facultyStyle = getFacultyBadgeStyle(submission.faculty);
  const hostname = extractHostname(submission.webUrl);

  const fallbackUrl = getFallbackThumbnailUrl(
    submission.webTitle,
    hostname
  );

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail Banner */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        <img
          src={imgError || !submission.thumbnailUrl ? fallbackUrl : submission.thumbnailUrl}
          alt={`Thumbnail ${submission.webTitle}`}
          onError={() => setImgError(true)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs pointer-events-auto flex items-center space-x-1 ${
              submission.status === 'Disahkan'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-amber-500/90 text-white'
            }`}
          >
            {submission.status === 'Disahkan' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span>{submission.status}</span>
          </span>

          {/* Web Host Pill */}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/80 text-slate-200 backdrop-blur-md border border-white/10 flex items-center space-x-1">
            <Globe className="w-3 h-3 text-sky-400" />
            <span className="truncate max-w-[120px]">{hostname}</span>
          </span>
        </div>

        {/* Hover Quick Action to Preview */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2 p-4">
          <button
            onClick={() => onPreview(submission)}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-blue-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Pratonton Segera</span>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Faculty Pill */}
          <div className="mb-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${facultyStyle.bg} ${facultyStyle.text} ${facultyStyle.border} truncate max-w-full`}
            >
              {submission.faculty}
            </span>
          </div>

          {/* Project Title */}
          <h3
            className="font-bold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => onPreview(submission)}
          >
            {submission.webTitle}
          </h3>

          {/* Description */}
          {submission.description && (
            <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {submission.description}
            </p>
          )}
        </div>

        {/* Student Meta Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-800 font-semibold truncate max-w-[70%]">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                {submission.studentName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{submission.studentName}</span>
            </div>

            <div className="flex items-center text-slate-500 text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded">
              <GraduationCap className="w-3 h-3 mr-1 text-slate-400" />
              <span>{submission.matricNo}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {submission.timestamp.split(' ')[0]}
            </span>
            <button
              onClick={() => onPreview(submission)}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Lihat Butiran →
            </button>
          </div>
        </div>

        {/* Action Buttons: Web & Slide Links */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <a
            href={submission.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200/60"
            title="Buka Laman Web Pelajar"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            <span className="truncate">Laman Web</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>

          <a
            href={submission.slideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200/60"
            title="Buka Slaid Pembentangan"
          >
            <Presentation className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            <span className="truncate">Slaid</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        </div>
      </div>
    </article>
  );
};
