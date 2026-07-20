import React, { useState } from 'react';
import { User, Comment } from '../types';
import { Send, User as UserIcon } from 'lucide-react';

interface UpdateCommentsProps {
  comments: Comment[];
  currentUser: User;
  onAddComment: (text: string) => void;
}

export const UpdateComments: React.FC<UpdateCommentsProps> = ({ comments, currentUser, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-8 backdrop-blur-xl relative z-30 shadow-2xl mt-8">
      <h3 className="text-xs uppercase font-extrabold tracking-tight text-brand-blue mb-6 tracking-widest flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        Weekly Discussion
      </h3>

      <div className="space-y-6 mb-6">
        {(!comments || comments.length === 0) ? (
          <p className="text-sm text-slate-500 italic text-center py-6">No comments yet. Start the discussion!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={`flex flex-col ${comment.isAdmin ? 'items-start' : 'items-end'}`}>
              <div className={`flex items-end gap-3 max-w-[85%] ${comment.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-8 h-8 rounded-full bg-slate-800/80 backdrop-blur-xl flex items-center justify-center shrink-0 border border-white/5 shadow-2xl shadow-black/40">
                   {comment.isAdmin ? (
                     <span className="text-brand-blue font-extrabold tracking-tight text-xs">ND</span>
                   ) : (
                     <UserIcon className="w-4 h-4 text-slate-500" />
                   )}
                </div>
                <div className={`flex flex-col ${comment.isAdmin ? 'items-start' : 'items-end'}`}>
                  <span className="text-[10px] text-slate-500 font-medium mb-1 px-1">
                    {comment.authorName} • {new Date(comment.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`p-3 md:p-6 rounded-2xl text-sm whitespace-pre-wrap ${
                    comment.isAdmin 
                      ? 'bg-slate-800/80 backdrop-blur-xl text-slate-500 rounded-bl-none' 
                      : 'bg-brand-blue text-white rounded-br-none'
                  }`}>
                    {comment.text}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ask a question or add a comment..."
          className="flex-1 bg-slate-950 border border-white/5 shadow-2xl shadow-black/40 rounded-2xl px-6 py-3 text-sm text-white focus:outline-none focus:border-brand-blue transition-all duration-300 ease-in-out"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="bg-brand-blue hover:bg-blue-600 disabled:bg-slate-800/80 backdrop-blur-xl disabled:text-slate-500 text-white p-3 rounded-2xl transition-all duration-300 ease-in-out flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
