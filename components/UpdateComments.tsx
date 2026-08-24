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
  const [showAll, setShowAll] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="relative w-full">
      

      <div className="space-y-6 mb-6">
        {(!comments || comments.length === 0) ? (
          <p className="text-sm text-slate-500 italic text-center py-6">No comments yet. Start the discussion!</p>
        ) : (
          (() => {
            const visibleComments = showAll ? comments : comments.slice(-3);
            return (
              <>
                {!showAll && comments.length > 3 && (
                  <button onClick={() => setShowAll(true)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    View previous comments ({comments.length - 3})
                  </button>
                )}
                {showAll && comments.length > 3 && (
                  <button onClick={() => setShowAll(false)} className="w-full py-2 mb-4 text-xs font-extrabold tracking-tight text-slate-500 hover:text-brand-blue bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    Hide previous comments
                  </button>
                )}
                {visibleComments.map((comment) => (
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
          ))}
              </>
            );
          })()
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
