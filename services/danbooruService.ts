
import type { DanbooruPost, CategorizedTags } from '../types';

// The public Danbooru API is generally okay with cross-origin requests from browsers.
const API_BASE_URL = 'https://danbooru.donmai.us';

/**
 * Extracts the post ID from a Danbooru URL.
 * @param url The Danbooru post URL.
 * @returns The post ID as a string, or null if not found.
 */
function getPostIdFromUrl(url: string): string | null {
  const match = url.match(/\/posts\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Fetches post data from Danbooru and processes it into categorized tags.
 * @param url The full Danbooru post URL.
 * @returns A promise that resolves to an object containing the image preview URL and categorized tags.
 */
export async function fetchDanbooruPost(url: string): Promise<{ post: DanbooruPost, tags: CategorizedTags }> {
  const postId = getPostIdFromUrl(url);

  if (!postId) {
    throw new Error('無効なDanbooru URLです。「https://danbooru.donmai.us/posts/...」のようなURLを使用してください。');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}.json`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('投稿が見つかりませんでした。URLを確認してください。');
    }
    throw new Error(`Danbooruからのデータ取得に失敗しました。ステータス: ${response.status}`);
  }

  const post: DanbooruPost = await response.json();

  const formatTags = (tagString: string) => tagString.split(' ').join(', ');

  const categorizedTags: CategorizedTags = {
    artist: formatTags(post.tag_string_artist),
    copyright: formatTags(post.tag_string_copyright),
    character: formatTags(post.tag_string_character),
    general: formatTags(post.tag_string_general),
    meta: formatTags(post.tag_string_meta),
  };
  
  return { post, tags: categorizedTags };
}
