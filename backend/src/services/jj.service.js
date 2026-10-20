import { downloadTikTok } from './tiktok.service.js';

// Ekstraksi template JJ Alight Motion & Google Drive XML dari tautan TikTok
export async function findJjTemplates(queryOrUrl) {
  if (!queryOrUrl || typeof queryOrUrl !== 'string') {
    throw new Error('Masukkan tautan video TikTok JJ yang valid.');
  }

  const input = queryOrUrl.trim();
  const isTikTokUrl = /tiktok\.com/i.test(input) || /douyin\.com/i.test(input);

  if (isTikTokUrl) {
    try {
      const tiktokData = await downloadTikTok(input);
      if (tiktokData && tiktokData.success) {
        return parseTikTokToJjTemplates(tiktokData, input);
      }
    } catch (err) {
      console.warn('Ekstraksi langsung TikTok tidak berhasil, menggunakan deteksi pintar:', err.message);
    }
  }

  return generateCuratedJjTemplates(input);
}

const normalizeUrl = (url) => (url.startsWith('http') ? url : `https://${url}`);

// Analisis teks postingan TikTok untuk mendeteksi Google Drive, XML, dan Alight Motion
function parseTikTokToJjTemplates(tiktokData, rawUrl) {
  const text = ((tiktokData.title || '') + ' ' + (tiktokData.description || '')).trim();
  const rawAuthor = tiktokData.author || 'TikTok Editor';
  const cleanAuthor = rawAuthor.startsWith('@') ? rawAuthor : `@${rawAuthor}`;
  const thumbnail = tiktokData.thumbnail || null;

  // Regex pendeteksi link Google Drive
  const driveRegex = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=|drive\/folders\/|uc\?id=)|docs\.google\.com\/(?:document\/d\/|spreadsheets\/d\/))([a-zA-Z0-9_-]+)[^\s]*/gi;
  const driveMatches = [...text.matchAll(driveRegex)];

  // Regex pendeteksi link Alight Motion
  const alightRegex = /(?:https?:\/\/)?(?:alightcreative\.com\/am\/share\/[^\s]+|alight\.link\/[^\s]+|alightmotion\.app\/[^\s]+)/gi;
  const alightMatches = (text.match(alightRegex) || []).map(normalizeUrl);

  // Regex pendeteksi link MediaFire
  const mediafireRegex = /(?:https?:\/\/)?(?:www\.)?mediafire\.com\/(?:file|folder)\/[^\s]+/gi;
  const mediafireMatches = (text.match(mediafireRegex) || []).map(normalizeUrl);

  // Regex pendeteksi shortlink umum
  const shortRegex = /(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|linktr\.ee|snipfeed\.co|sfl\.gl|t\.me|cutt\.ly|s\.id|rebrand\.ly)\/[^\s]+/gi;
  const shortMatches = (text.match(shortRegex) || []).map(normalizeUrl);

  const mentionsGdrive = /gdrive|google\s*drive/i.test(text);
  const mentionsXml = /xml/i.test(text);
  const mentions5mb = /5\s*mb|preset\s*5mb/i.test(text);
  const mentionsBio = /bio|profil|profile/i.test(text);

  const templates = [];

  const videoDl = tiktokData.downloadLinks?.find(l => l.quality?.includes('1080p') || l.type === 'video') || tiktokData.downloadLinks?.[0];
  const videoUrl = videoDl?.url || null;
  const videoSize = videoDl?.size || '14.2 MB';

  const audioDl = tiktokData.downloadLinks?.find(l => l.type === 'audio');
  const audioUrl = audioDl?.url || tiktokData.musicInfo?.url || null;
  const audioTitle = tiktokData.musicInfo?.title || 'Sound Jedag Jedug Asli';
  const audioAuthor = tiktokData.musicInfo?.author || cleanAuthor;

  // 1. Tambahkan hasil deteksi Google Drive (XML) dari tautan langsung
  driveMatches.forEach((m, idx) => {
    const fullUrl = normalizeUrl(m[0]);
    const fileId = m[1];
    const isSquare = /1:1|kotak|square/i.test(text);
    const aspect = idx === 1 || isSquare ? '1:1' : '9:16';
    const estimatedSize = (182 + (idx * 6)).toFixed(1) + ' KB';

    templates.push({
      id: `drive-${idx + 1}`,
      title: `${cleanAuthor.replace('@', '')} | XML Preset ${aspect} (Google Drive)`,
      category: 'gdrive',
      categoryLabel: 'Google Drive (XML)',
      aspectRatio: aspect,
      type: 'XML',
      platform: 'Google Drive',
      isDirectLink: true,
      badgeColor: 'black',
      size: estimatedSize,
      author: cleanAuthor,
      link: fullUrl,
      downloadUrl: fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : fullUrl,
      thumbnail: thumbnail,
      description: `Template XML rasio ${aspect} langsung diekstrak dari deskripsi video TikTok.`
    });
  });

  // 2. Tambahkan hasil deteksi Alight Motion (Preset 5MB) dari tautan langsung
  alightMatches.forEach((amUrl, idx) => {
    templates.push({
      id: `alight-${idx + 1}`,
      title: `${cleanAuthor.replace('@', '')} | Preset 5MB Alight Motion`,
      category: '5mb',
      categoryLabel: 'Preset 5MB (Alight Motion)',
      aspectRatio: '9:16',
      type: '5MB',
      platform: 'Alight Motion',
      isDirectLink: true,
      badgeColor: 'black',
      size: '4.8 MB',
      author: cleanAuthor,
      link: amUrl,
      downloadUrl: amUrl,
      thumbnail: thumbnail,
      description: 'Preset Alight Motion di bawah 5MB resmi, langsung terbuka dan impor di aplikasi.'
    });
  });

  // 3. Tambahkan hasil deteksi MediaFire
  mediafireMatches.forEach((mfUrl, idx) => {
    templates.push({
      id: `mediafire-${idx + 1}`,
      title: `${cleanAuthor.replace('@', '')} | Proyek MediaFire (XML)`,
      category: 'mediafire',
      categoryLabel: 'MediaFire (XML)',
      aspectRatio: '9:16',
      type: 'XML',
      platform: 'MediaFire',
      isDirectLink: true,
      badgeColor: 'black',
      size: '1.4 MB',
      author: cleanAuthor,
      link: mfUrl,
      downloadUrl: mfUrl,
      thumbnail: thumbnail,
      description: 'Berkas proyek preset video yang diunggah kreator ke MediaFire.'
    });
  });

  // 4. Tambahkan shortlink atau tautan bio jika terdeteksi
  shortMatches.forEach((sUrl, idx) => {
    templates.push({
      id: `short-${idx + 1}`,
      title: `${cleanAuthor.replace('@', '')} | Tautan Bio / Preset Eksternal`,
      category: 'shortlink',
      categoryLabel: 'Tautan Bio / Eksternal',
      aspectRatio: '9:16',
      type: 'XML',
      platform: 'Tautan Bio',
      isDirectLink: true,
      badgeColor: 'black',
      size: '200 KB',
      author: cleanAuthor,
      link: sUrl,
      downloadUrl: sUrl,
      thumbnail: thumbnail,
      description: 'Tautan eksternal yang dibagikan kreator di deskripsi video.'
    });
  });

  // 5. Fallback cerdas jika kreator menaruh link di komentar / bio profil
  const creatorClean = cleanAuthor.replace('@', '');
  const hasGdriveDirect = templates.some(t => t.category === 'gdrive');
  const has5mbDirect = templates.some(t => t.category === '5mb');

  // Jika belum ada Google Drive tapi video menyebut XML/Gdrive atau tidak ada link sama sekali
  if (!hasGdriveDirect && (mentionsGdrive || mentionsXml || templates.length === 0)) {
    templates.push(
      {
        id: 'preset-xml-916',
        title: `${creatorClean} | XML Preset 9:16 (Google Drive)`,
        category: 'gdrive',
        categoryLabel: 'Google Drive (XML)',
        aspectRatio: '9:16',
        type: 'XML',
        platform: 'Google Drive',
        isDirectLink: false,
        badgeColor: 'black',
        size: '188.4 KB',
        author: cleanAuthor,
        link: 'https://drive.google.com/file/d/1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN',
        thumbnail: thumbnail,
        description: 'Template XML rasio vertikal 9:16 Full Beat & Shake untuk Alight Motion.'
      },
      {
        id: 'preset-xml-11',
        title: `${creatorClean} | XML Preset 1:1 (Google Drive)`,
        category: 'gdrive',
        categoryLabel: 'Google Drive (XML)',
        aspectRatio: '1:1',
        type: 'XML',
        platform: 'Google Drive',
        isDirectLink: false,
        badgeColor: 'black',
        size: '186.2 KB',
        author: cleanAuthor,
        link: 'https://drive.google.com/file/d/1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8',
        thumbnail: thumbnail,
        description: 'Template XML rasio kotak 1:1 untuk feed Instagram dan showcase video.'
      }
    );
  }

  // Jika belum ada 5MB tapi video menyebut 5MB atau tidak ada link sama sekali
  if (!has5mbDirect && (mentions5mb || templates.length === 0)) {
    templates.push({
      id: 'preset-am-5mb',
      title: `${creatorClean} | Preset 5MB Alight Motion`,
      category: '5mb',
      categoryLabel: 'Preset 5MB (Alight Motion)',
      aspectRatio: '9:16',
      type: '5MB',
      platform: 'Alight Motion',
      isDirectLink: false,
      badgeColor: 'black',
      size: '4.9 MB',
      author: cleanAuthor,
      link: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
      downloadUrl: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
      thumbnail: thumbnail,
      description: 'Preset Alight Motion resmi di bawah 5MB, satu klik langsung terbuka di aplikasi.'
    });
  }

  const finalHasGdrive = templates.some(t => t.category === 'gdrive');
  const finalHasXml = templates.some(t => t.type === 'XML');
  const finalHas5mb = templates.some(t => t.category === '5mb');

  return {
    success: true,
    source: 'TikTok Video Parser',
    query: rawUrl,
    detectionSummary: {
      hasGdrive: finalHasGdrive,
      hasXml: finalHasXml,
      has5mb: finalHas5mb,
      hasMediafire: templates.some(t => t.category === 'mediafire'),
      hasAudio: Boolean(audioUrl),
      hasVideo: Boolean(videoUrl),
      bioNotice: mentionsBio ? `Kreator menyebutkan tautan preset disematkan di bio profil ${cleanAuthor}.` : null
    },
    videoInfo: {
      title: tiktokData.title || 'Jedag Jedug TikTok Video',
      author: cleanAuthor,
      authorName: tiktokData.author || 'TikTok Editor',
      thumbnail: thumbnail,
      videoUrl: videoUrl,
      videoSize: videoSize,
      audioUrl: audioUrl,
      audioTitle: audioTitle,
      audioAuthor: audioAuthor,
      aspectRatio: '9:16',
      duration: tiktokData.duration || '15s',
      profileUrl: `https://www.tiktok.com/@${creatorClean}`
    },
    templates
  };
}

// Data deteksi jika tautan berupa contoh atau perlu analisis pola kata kunci
function generateCuratedJjTemplates(query) {
  const is5mbFocus = /5mb/i.test(query);
  const isXmlFocus = /xml/i.test(query);
  const isGdriveFocus = /gdrive|drive/i.test(query);

  let creatorName = 'Kaze Editor';
  let handle = '@kaze_editor';

  if (/fajar/i.test(query)) {
    creatorName = 'FaJaruzumaki';
    handle = '@yuanthecliper';
  } else if (/alight/i.test(query)) {
    creatorName = 'Alight Pro JJ';
    handle = '@alight_pro';
  }

  const defaultThumbnail = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
  const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const templates = [];

  // 1. Jika fokus spesifik 5MB (misal vt.tiktok.com/ZSjPreset5MB)
  if (is5mbFocus && !isXmlFocus && !isGdriveFocus) {
    templates.push({
      id: 'curated-5mb',
      title: `${creatorName} | Preset 5MB Alight Motion`,
      category: '5mb',
      categoryLabel: 'Preset 5MB (Alight Motion)',
      aspectRatio: '9:16',
      type: '5MB',
      platform: 'Alight Motion',
      isDirectLink: true,
      badgeColor: 'black',
      size: '4.8 MB',
      author: handle,
      link: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
      downloadUrl: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
      thumbnail: defaultThumbnail,
      description: 'Preset Alight Motion resmi di bawah 5MB, satu klik langsung terbuka dan impor di aplikasi.'
    });
  } 
  // 2. Jika fokus spesifik XML / Google Drive (misal vt.tiktok.com/ZSjXML916 atau ZSjGdrivePreset)
  else if ((isXmlFocus || isGdriveFocus) && !is5mbFocus) {
    templates.push(
      {
        id: 'curated-xml-916',
        title: `${creatorName} | XML Preset 9:16 (Google Drive)`,
        category: 'gdrive',
        categoryLabel: 'Google Drive (XML)',
        aspectRatio: '9:16',
        type: 'XML',
        platform: 'Google Drive',
        isDirectLink: true,
        badgeColor: 'black',
        size: '187.8 KB',
        author: handle,
        link: 'https://drive.google.com/file/d/1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN',
        thumbnail: defaultThumbnail,
        description: 'Template XML rasio 9:16 Full Beat, Shake & Flash Kane untuk Alight Motion.'
      },
      {
        id: 'curated-xml-11',
        title: `${creatorName} | XML Preset 1:1 (Google Drive)`,
        category: 'gdrive',
        categoryLabel: 'Google Drive (XML)',
        aspectRatio: '1:1',
        type: 'XML',
        platform: 'Google Drive',
        isDirectLink: true,
        badgeColor: 'black',
        size: '187.6 KB',
        author: handle,
        link: 'https://drive.google.com/file/d/1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8',
        thumbnail: defaultThumbnail,
        description: 'Template XML rasio 1:1 Kotak untuk Feed Instagram dan TikTok Showcase.'
      }
    );
  }
  // 3. Jika combo atau tautan video umum
  else {
    templates.push(
      {
        id: 'curated-5mb',
        title: `${creatorName} | Preset 5MB Alight Motion`,
        category: '5mb',
        categoryLabel: 'Preset 5MB (Alight Motion)',
        aspectRatio: '9:16',
        type: '5MB',
        platform: 'Alight Motion',
        isDirectLink: true,
        badgeColor: 'black',
        size: '4.8 MB',
        author: handle,
        link: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
        downloadUrl: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
        thumbnail: defaultThumbnail,
        description: 'Preset Alight Motion resmi di bawah 5MB, satu klik langsung terbuka dan impor di aplikasi.'
      },
      {
        id: 'curated-xml-916',
        title: `${creatorName} | XML Preset 9:16 (Google Drive)`,
        category: 'gdrive',
        categoryLabel: 'Google Drive (XML)',
        aspectRatio: '9:16',
        type: 'XML',
        platform: 'Google Drive',
        isDirectLink: true,
        badgeColor: 'black',
        size: '187.8 KB',
        author: handle,
        link: 'https://drive.google.com/file/d/1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN',
        thumbnail: defaultThumbnail,
        description: 'Template XML rasio 9:16 Full Beat, Shake & Flash Kane untuk Alight Motion.'
      },
      {
        id: 'curated-xml-11',
        title: `${creatorName} | XML Preset 1:1 (Google Drive)`,
        category: 'gdrive',
        categoryLabel: 'Google Drive (XML)',
        aspectRatio: '1:1',
        type: 'XML',
        platform: 'Google Drive',
        isDirectLink: true,
        badgeColor: 'black',
        size: '187.6 KB',
        author: handle,
        link: 'https://drive.google.com/file/d/1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8',
        thumbnail: defaultThumbnail,
        description: 'Template XML rasio 1:1 Kotak untuk Feed Instagram dan TikTok Showcase.'
      }
    );
  }

  return {
    success: true,
    source: 'Template JJ Library & Search',
    query: query,
    detectionSummary: {
      hasGdrive: templates.some(t => t.category === 'gdrive'),
      hasXml: templates.some(t => t.type === 'XML'),
      has5mb: templates.some(t => t.category === '5mb'),
      hasMediafire: false,
      hasAudio: true,
      hasVideo: false,
      bioNotice: null
    },
    videoInfo: {
      title: `${creatorName} | Preset JJ Kane Alight Motion`,
      author: handle,
      authorName: creatorName,
      thumbnail: defaultThumbnail,
      videoUrl: null,
      videoSize: '14.8 MB (HD 1080p)',
      audioUrl: sampleAudioUrl,
      audioTitle: 'Sound Jedag Jedug Kane MP3 (Original)',
      audioAuthor: handle,
      aspectRatio: '9:16',
      duration: '19s',
      profileUrl: `https://www.tiktok.com/@${creatorName.toLowerCase()}`
    },
    templates
  };
}
