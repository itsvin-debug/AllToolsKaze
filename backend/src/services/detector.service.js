// Layanan deteksi URL untuk 16 platform media sosial dan streaming resmi Kaze Studio

export const PLATFORM_NAMES = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  spotify: 'Spotify',
  bilibili: 'Bilibili',
  douyin: 'Douyin',
  rednote: 'Rednote (Xiaohongshu)',
  threads: 'Threads',
  pinterest: 'Pinterest',
  appleMusic: 'Apple Music',
  facebook: 'Facebook',
  bandcamp: 'Bandcamp',
  pixiv: 'Pixiv',
  reddit: 'Reddit',
  terabox: 'Terabox'
};

export const PLATFORM_REGEX = {
  tiktok: /(?:https?:\/\/)?(?:www\.|v[mt]\.|vt\.)?tiktok\.com\/(?:@[\w.-]+\/video\/\d+|[\w.-]+|\S+)/i,
  instagram: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am|ig\.me)\/(?:p|reel|reels|tv|stories|share)?\/?([\w.-]+)?/i,
  youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  twitter: /(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/i,
  spotify: /(?:https?:\/\/)?(?:open\.)?spotify\.(?:com|link)\/(?:track|album|playlist|episode)\/([a-zA-Z0-9]+)/i,
  bilibili: /(?:https?:\/\/)?(?:www\.)?(?:bilibili\.(?:com|tv)|b23\.tv)\/(?:video\/)?([a-zA-Z0-9]+)/i,
  douyin: /(?:https?:\/\/)?(?:www\.)?(?:douyin\.com|iesdouyin\.com)\/(?:video\/)?([a-zA-Z0-9]+)/i,
  rednote: /(?:https?:\/\/)?(?:www\.)?(?:xiaohongshu\.com|xhslink\.com)\/(?:discovery\/item\/|explore\/|video\/)?([a-zA-Z0-9]+)/i,
  threads: /(?:https?:\/\/)?(?:www\.)?threads\.net\/(?:@[\w.-]+\/post\/)?([a-zA-Z0-9_-]+)/i,
  pinterest: /(?:https?:\/\/)?(?:www\.|[a-z]{2}\.)?(?:pinterest\.(?:com|[a-z]{2})|pin\.it)\/(?:pin\/)?([a-zA-Z0-9_-]+)/i,
  appleMusic: /(?:https?:\/\/)?(?:music\.)?apple\.com\/([a-z]{2}\/)?(?:album|song|playlist)\/([a-zA-Z0-9_-]+)/i,
  facebook: /(?:https?:\/\/)?(?:www\.|m\.|mobile\.)?(?:facebook\.com|fb\.watch|fb\.com)\/(?:watch\/?\?v=|reel\/|videos\/|[\w.-]+\/videos\/)?([a-zA-Z0-9_-]+)/i,
  bandcamp: /(?:https?:\/\/)?(?:[a-zA-Z0-9_-]+\.)?bandcamp\.com\/(?:track|album)\/([a-zA-Z0-9_-]+)/i,
  pixiv: /(?:https?:\/\/)?(?:www\.)?(?:pixiv\.net|phixiv\.net)\/(?:[a-z]{2}\/)?(?:artworks\/)?(\d+)/i,
  reddit: /(?:https?:\/\/)?(?:www\.|old\.|v\.)?(?:reddit\.com|redd\.it)\/(?:r\/[\w.-]+\/comments\/|video\/)?([a-zA-Z0-9_-]+)/i,
  terabox: /(?:https?:\/\/)?(?:www\.)?(?:terabox\.com|1024tera\.com|teraboxapp\.com|terabox\.app|4shared\.com)\/(?:s\/|sharing\/link\?surl=)?([a-zA-Z0-9_-]+)/i
};

// Fungsi deteksi platform dari URL pengguna
export function detectPlatform(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, platform: null, cleanedUrl: null };
  }

  const cleanedUrl = rawUrl.trim();
  const lowerUrl = cleanedUrl.toLowerCase();

  // 1. Cek spesifik per domain keyword untuk akurasi instan
  if (lowerUrl.includes('tiktok.com')) return { valid: true, platform: 'tiktok', cleanedUrl };
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am') || lowerUrl.includes('ig.me')) return { valid: true, platform: 'instagram', cleanedUrl };
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return { valid: true, platform: 'youtube', cleanedUrl };
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return { valid: true, platform: 'twitter', cleanedUrl };
  if (lowerUrl.includes('spotify.com') || lowerUrl.includes('spotify.link') || lowerUrl.includes('spoti.fi')) return { valid: true, platform: 'spotify', cleanedUrl };
  if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('bilibili.tv') || lowerUrl.includes('b23.tv')) return { valid: true, platform: 'bilibili', cleanedUrl };
  if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com')) return { valid: true, platform: 'douyin', cleanedUrl };
  if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) return { valid: true, platform: 'rednote', cleanedUrl };
  if (lowerUrl.includes('threads.net')) return { valid: true, platform: 'threads', cleanedUrl };
  if (lowerUrl.includes('pinterest.com') || lowerUrl.includes('pin.it')) return { valid: true, platform: 'pinterest', cleanedUrl };
  if (lowerUrl.includes('music.apple.com') || lowerUrl.includes('itunes.apple.com') || lowerUrl.includes('apple.co')) return { valid: true, platform: 'appleMusic', cleanedUrl };
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch') || lowerUrl.includes('fb.com')) return { valid: true, platform: 'facebook', cleanedUrl };
  if (lowerUrl.includes('bandcamp.com')) return { valid: true, platform: 'bandcamp', cleanedUrl };
  if (lowerUrl.includes('pixiv.net') || lowerUrl.includes('phixiv.net')) return { valid: true, platform: 'pixiv', cleanedUrl };
  if (lowerUrl.includes('reddit.com') || lowerUrl.includes('v.redd.it') || lowerUrl.includes('redd.it')) return { valid: true, platform: 'reddit', cleanedUrl };
  if (lowerUrl.includes('terabox.com') || lowerUrl.includes('1024tera.com') || lowerUrl.includes('teraboxapp.com') || lowerUrl.includes('terabox.app')) return { valid: true, platform: 'terabox', cleanedUrl };

  // 2. Evaluasi Regex sekunder
  for (const [key, regex] of Object.entries(PLATFORM_REGEX)) {
    if (regex.test(cleanedUrl)) {
      return { valid: true, platform: key, cleanedUrl };
    }
  }

  return { valid: false, platform: 'unknown', cleanedUrl };
}
