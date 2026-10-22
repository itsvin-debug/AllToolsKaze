import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import CosmicBackButton from './CosmicBackButton';
import { 
  Music, 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  Download, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  MoveUp, 
  MoveDown,
  Scissors,
  Layers,
  FileAudio
} from 'lucide-react';
import { addGalleryItem } from '../services/storageService';

export default function AudioMergerScreen({ onBack }) {
  const [tracks, setTracks] = useState([]);
  const [merging, setMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState(null);

  const audioRefs = useRef({});
  const masterAudioRef = useRef(null);

  // Helper format detik ke MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle upload file audio/video
  const handleFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMessage('');

    files.forEach((file) => {
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');

      if (!isAudio && !isVideo) {
        setErrorMessage('File harus berupa Audio (MP3, WAV, M4A) atau Video (MP4, WebM).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;

        // Dapatkan durasi file
        const tempAudio = new Audio();
        tempAudio.src = dataUrl;
        tempAudio.onloadedmetadata = () => {
          const dur = Math.floor(tempAudio.duration) || 30;
          
          const newTrack = {
            id: Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            name: file.name,
            size: file.size,
            dataUrl,
            totalDuration: dur,
            startMin: 0,
            startSec: 0,
            endMin: Math.floor(dur / 60),
            endSec: dur % 60,
            volume: 1.0,
            isVideo
          };

          setTracks((prev) => [...prev, newTrack]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // Update nilai menit/detik potong
  const updateTrackField = (id, field, value) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };
        return updated;
      })
    );
  };

  // Hapus track
  const removeTrack = (id) => {
    if (playingTrackId === id) {
      if (audioRefs.current[id]) audioRefs.current[id].pause();
      setPlayingTrackId(null);
    }
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  // Pindahkan urutan track (naik/turun)
  const moveTrack = (index, direction) => {
    const newTracks = [...tracks];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newTracks.length) return;
    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIndex];
    newTracks[targetIndex] = temp;
    setTracks(newTracks);
  };

  // Play/Pause preview potongan track tertentu
  const togglePlayTrack = (track) => {
    const audio = audioRefs.current[track.id];
    if (!audio) return;

    if (playingTrackId === track.id) {
      audio.pause();
      setPlayingTrackId(null);
    } else {
      // Pause track lain
      if (playingTrackId && audioRefs.current[playingTrackId]) {
        audioRefs.current[playingTrackId].pause();
      }

      const startTotalSec = (Number(track.startMin) * 60) + Number(track.startSec);
      const endTotalSec = (Number(track.endMin) * 60) + Number(track.endSec);

      audio.currentTime = startTotalSec;
      audio.volume = track.volume;
      audio.play();
      setPlayingTrackId(track.id);

      // Otomatis stop saat mencapai end time
      audio.ontimeupdate = () => {
        if (audio.currentTime >= endTotalSec) {
          audio.pause();
          setPlayingTrackId(null);
        }
      };
    }
  };

  // Eksekusi penggabungan audio via backend FFmpeg
  const handleMerge = async () => {
    if (tracks.length === 0) {
      setErrorMessage('Harap tambahkan minimal 1 track audio.');
      return;
    }

    setMerging(true);
    setErrorMessage('');
    setMergeResult(null);

    try {
      const payloadTracks = tracks.map((t) => {
        const startSec = (Number(t.startMin) * 60) + Number(t.startSec);
        const endSec = (Number(t.endMin) * 60) + Number(t.endSec);
        return {
          base64: t.dataUrl,
          startTime: startSec,
          endTime: endSec,
          volume: t.volume
        };
      });

      const res = await axios.post('/api/merge-audio', {
        tracks: payloadTracks
      }, {
        timeout: 120000
      });

      if (res.data && res.data.success) {
        setMergeResult(res.data.data);

        // Simpan otomatis ke galeri perangkat
        addGalleryItem({
          title: `Audio Master (${res.data.data.totalTracksMerged || tracks.length} Tracks)`,
          type: 'audio',
          category: 'Audio Merger',
          extension: 'MP3',
          size: res.data.data.sizeFormatted || '1.8 MB',
          previewUrl: res.data.data.url,
          downloadData: res.data.data.url,
          filename: res.data.data.fileName || 'merged_audio_master.mp3'
        });
      } else {
        setErrorMessage(res.data?.message || 'Gagal menggabungkan audio.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses penggabungan audio.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-10 w-full max-w-4xl mx-auto">
      
      {/* Tombol Navigasi Kembali */}
      <div className="w-full flex items-center justify-between mb-6">
        <CosmicBackButton onClick={onBack} label="Kembali ke Beranda Tools" />

        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Track Timeline Merger</span>
        </div>
      </div>

      {/* Header Judul Fitur */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Music className="w-3.5 h-3.5" />
          <span>Audio Timeline Studio</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface mb-2">
          Penggabungan Audio & Video
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Atur menit dan detik setiap audio/video yang dimasukkan, potong bagian terbaiknya, lalu satukan menjadi satu file audio master yang rapi.
        </p>
      </div>

      {/* Upload Zone & Tombol Tambah */}
      <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-xl mb-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
          <div>
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Daftar Track Audio ({tracks.length} Track)</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              Tiap track bisa diatur durasi potong (menit & detik), volume, dan urutannya.
            </p>
          </div>

          <label className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-600/20 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Tambah Audio / Video</span>
            <input
              type="file"
              multiple
              accept="audio/*,video/mp4,video/webm"
              className="hidden"
              onChange={handleFilesUpload}
            />
          </label>
        </div>

        {/* Pesan Error */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Daftar Track */}
        {tracks.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-on-surface-variant">
            <FileAudio className="w-12 h-12 text-amber-400/60 mb-3" />
            <p className="text-sm font-semibold text-on-surface">Belum ada audio yang ditambahkan</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Klik tombol "Tambah Audio / Video" di atas untuk memasukkan track.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tracks.map((track, idx) => {
              const startTotal = (Number(track.startMin) * 60) + Number(track.startSec);
              const endTotal = (Number(track.endMin) * 60) + Number(track.endSec);
              const sliceDur = Math.max(0, endTotal - startTotal);

              return (
                <div
                  key={track.id}
                  className="p-4 sm:p-5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-4 hover:border-amber-500/40 transition-colors"
                >
                  <audio
                    ref={(el) => (audioRefs.current[track.id] = el)}
                    src={track.dataUrl}
                    preload="metadata"
                  />

                  {/* Header Track */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm font-bold text-on-surface truncate">
                          {track.name}
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-mono">
                          Total Durasi: {formatTime(track.totalDuration)} • {track.isVideo ? 'Video Audio' : 'Audio MP3'}
                        </p>
                      </div>
                    </div>

                    {/* Tombol Reorder & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePlayTrack(track)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          playingTrackId === track.id
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                        title="Tes Dengar Potongan"
                      >
                        {playingTrackId === track.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Tes Potongan</span>
                      </button>

                      <button
                        onClick={() => moveTrack(idx, -1)}
                        disabled={idx === 0}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high disabled:opacity-30 text-on-surface transition-colors cursor-pointer"
                        title="Geser ke Atas"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => moveTrack(idx, 1)}
                        disabled={idx === tracks.length - 1}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high disabled:opacity-30 text-on-surface transition-colors cursor-pointer"
                        title="Geser ke Bawah"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => removeTrack(track.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Hapus Track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pengaturan Detik & Menit Potongan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-outline-variant/20">
                    
                    {/* Waktu Mulai (Start) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Mulai (Menit : Detik):</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={track.startMin}
                          onChange={(e) => updateTrackField(track.id, 'startMin', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-mono text-center"
                          title="Menit Mulai"
                        />
                        <span className="text-xs font-bold">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={track.startSec}
                          onChange={(e) => updateTrackField(track.id, 'startSec', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-16 px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-mono text-center"
                          title="Detik Mulai"
                        />
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          ({formatTime(startTotal)})
                        </span>
                      </div>
                    </div>

                    {/* Waktu Selesai (End) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-amber-400" />
                        <span>Selesai (Menit : Detik):</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={track.endMin}
                          onChange={(e) => updateTrackField(track.id, 'endMin', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-mono text-center"
                          title="Menit Selesai"
                        />
                        <span className="text-xs font-bold">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={track.endSec}
                          onChange={(e) => updateTrackField(track.id, 'endSec', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-16 px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-mono text-center"
                          title="Detik Selesai"
                        />
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          ({formatTime(endTotal)})
                        </span>
                      </div>
                    </div>

                    {/* Volume & Durasi Hasil */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          <span>Volume: {Math.round(track.volume * 100)}%</span>
                        </span>
                        <span className="text-amber-400 font-mono">
                          Durasi: {formatTime(sliceDur)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.05"
                        value={track.volume}
                        onChange={(e) => updateTrackField(track.id, 'volume', parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Tombol Gabungkan Audio */}
        {tracks.length > 0 && (
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
            <button
              onClick={handleMerge}
              disabled={merging}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
            >
              {merging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menggabungkan Semua Audio via FFmpeg...</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  <span>Satukan Semua Audio Menjadi Satu</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* HASIL MASTER AUDIO YANG SUDAH DIGABUNG */}
      {mergeResult && (
        <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-on-surface">
                  Semua Audio Berhasil Digabungkan!
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Total {mergeResult.totalTracksMerged} track audio disatukan menjadi satu file MP3 master.
                </p>
              </div>
            </div>

            <a
              href={mergeResult.url}
              download={mergeResult.fileName}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh MP3 ({mergeResult.sizeFormatted})</span>
            </a>
          </div>

          {/* Player Audio Master */}
          <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/30 flex flex-col items-center gap-3">
            <p className="text-xs font-semibold text-on-surface-variant">Dengarkan Audio Hasil Penggabungan:</p>
            <audio
              ref={masterAudioRef}
              src={mergeResult.url}
              controls
              className="w-full max-w-lg"
            />
          </div>

        </div>
      )}

    </main>
  );
}
