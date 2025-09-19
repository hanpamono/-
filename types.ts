
// Relevant fields from the Danbooru API response
export interface DanbooruPost {
  id: number;
  tag_string_artist: string;
  tag_string_copyright: string;
  tag_string_character: string;
  tag_string_general: string;
  tag_string_meta: string;
  preview_file_url: string;
}

// Processed, categorized tags with comma separation
export interface CategorizedTags {
  artist: string;
  copyright: string;
  character: string;
  general: string;
  meta: string;
}

// Type for identifying tag categories
export type TagCategory = keyof CategorizedTags;
