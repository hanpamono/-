
import React, { useState, useMemo, useCallback } from 'react';
import type { DanbooruPost, CategorizedTags, TagCategory } from './types';
import { fetchDanbooruPost } from './services/danbooruService';
import ApiWarningModal from './components/ApiWarningModal';
import { CheckIcon, ClipboardIcon, SearchIcon } from './components/icons';

const API_REQUEST_WARNING_THRESHOLD = 50;

const CATEGORY_LABELS: Record<TagCategory, string> = {
  artist: 'アーティスト',
  copyright: '作品名',
  character: 'キャラクター',
  general: '要素',
  meta: 'メタ要素',
};

// Define this component outside of App to prevent re-creation on every render.
interface CategoryToggleProps {
  category: TagCategory;
  isVisible: boolean;
  onToggle: (category: TagCategory) => void;
}

const CategoryToggle: React.FC<CategoryToggleProps> = ({ category, isVisible, onToggle }) => {
  const label = CATEGORY_LABELS[category];
  return (
    <div className="flex items-center">
      <button
        onClick={() => onToggle(category)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
          isVisible ? 'bg-brand-blue' : 'bg-gray-600'
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
            isVisible ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      <label htmlFor={category} className="ml-3 text-sm font-medium text-gray-300 select-none">
        {label}
      </label>
    </div>
  );
};


const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [post, setPost] = useState<DanbooruPost | null>(null);
  const [categorizedTags, setCategorizedTags] = useState<CategorizedTags | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiRequestCount, setApiRequestCount] = useState<number>(0);
  const [showApiWarning, setShowApiWarning] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  const [categoryVisibility, setCategoryVisibility] = useState<Record<TagCategory, boolean>>({
    artist: true,
    copyright: true,
    character: true,
    general: true,
    meta: false,
  });

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setError('DanbooruのURLを入力してください。');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCategorizedTags(null);
    setPost(null);

    const newCount = apiRequestCount + 1;
    setApiRequestCount(newCount);

    if (newCount >= API_REQUEST_WARNING_THRESHOLD) {
      setShowApiWarning(true);
    }
    
    try {
      const { post: fetchedPost, tags: fetchedTags } = await fetchDanbooruPost(url);
      setCategorizedTags(fetchedTags);
      setPost(fetchedPost);
    } catch (e: any) {
      setError(e.message || '不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [url, apiRequestCount]);

  const handleToggleCategory = (category: TagCategory) => {
    setCategoryVisibility(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const combinedTags = useMemo(() => {
    if (!categorizedTags) return '';
    const parts: string[] = [];
    const orderedCategories: TagCategory[] = ['artist', 'copyright', 'character', 'general', 'meta'];

    orderedCategories.forEach(category => {
      if (categoryVisibility[category] && categorizedTags[category]) {
        parts.push(categorizedTags[category]);
      }
    });

    return parts.filter(p => p.trim() !== '').join(', ');
  }, [categorizedTags, categoryVisibility]);

  const handleCopyToClipboard = () => {
    if (!combinedTags) return;
    navigator.clipboard.writeText(combinedTags).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy tags: ', err);
      setError('タグをクリップボードにコピーできませんでした。');
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <ApiWarningModal isOpen={showApiWarning} onClose={() => setShowApiWarning(false)} />
      
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Danbooruタグ抽出ツール</h1>
          <p className="mt-4 text-lg text-gray-400">Danbooruの投稿URLを貼り付けて、タグを抽出・カスタマイズします。</p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://danbooru.donmai.us/posts/..."
                className="flex-grow bg-gray-900 border border-gray-600 text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
                disabled={isLoading}
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex items-center justify-center bg-brand-blue hover:bg-brand-blue/80 disabled:bg-brand-blue/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <SearchIcon className="w-5 h-5 mr-2" />
                )}
                <span className="ml-2">{isLoading ? '分析中...' : '分析'}</span>
              </button>
            </div>
            {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
          </div>

          {isLoading && (
            <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 animate-pulse">
                <div className="w-48 h-48 bg-gray-700 rounded-lg mx-auto mb-6"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-20 bg-gray-700 rounded w-full"></div>
            </div>
          )}
          
          {categorizedTags && post && (
            <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex-shrink-0">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={post.preview_file_url} 
                      alt="Post preview" 
                      className="rounded-lg w-full object-cover aspect-square shadow-md hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
                <div className="md:w-2/3 flex flex-col">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">カテゴリーを選択</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(Object.keys(CATEGORY_LABELS) as TagCategory[]).map(cat => (
                         <CategoryToggle key={cat} category={cat} isVisible={categoryVisibility[cat]} onToggle={handleToggleCategory} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-2">結合されたタグ</h3>
                    <div className="relative flex-grow">
                      <textarea
                        readOnly
                        value={combinedTags}
                        className="w-full h-32 sm:h-full min-h-[120px] bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                      <button
                        onClick={handleCopyToClipboard}
                        className="absolute top-2 right-2 p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition"
                        title="クリップボードにコピー"
                      >
                        {copySuccess ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
