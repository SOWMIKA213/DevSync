import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  MoreVertical,
  Users,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

const MeetingPanel: React.FC = () => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    const startVideo = async () => {
      setMediaError(null);
      try {
        // Try both video and audio first
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn("Initial media access failed, trying fallbacks...", err);
        
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          try {
            // Try only video
            const videoOnly = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(videoOnly);
            if (videoRef.current) {
              videoRef.current.srcObject = videoOnly;
            }
            return;
          } catch (vErr) {
            try {
              // Try only audio
              const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
              setStream(audioOnly);
              setIsVideoOn(false); // No camera found
              return;
            } catch (aErr) {
              setMediaError("No camera or microphone found. Please check your device connections.");
            }
          }
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMediaError("Camera/Microphone access denied. Please enable permissions in your browser.");
        } else {
          setMediaError("Could not access camera or microphone.");
        }
      }
    };

    if (isVideoOn) {
      startVideo();
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isVideoOn]);

  const participants = [
    { id: '1', name: 'You', color: '#ab47bc', isMe: true },
    { id: '2', name: 'Sarah Chen', color: '#6a1b9a' },
    { id: '3', name: 'Alex Rivera', color: '#8e24aa' },
  ];

  return (
    <div className={`flex flex-col h-full border-l transition-colors duration-500 ${
      isDark ? 'bg-purple-900/20 border-white/5' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Video className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`font-bold text-sm ${isDark ? 'text-purple-200' : 'text-gray-900'}`}>Live Meeting</h2>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${isDark ? 'bg-purple-500/20' : 'bg-red-50'}`}>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-purple-300' : 'text-red-600'}`}>REC</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {mediaError && (
          <div className={`p-3 rounded-xl border flex items-center gap-3 mb-4 transition-colors ${
            isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">{mediaError}</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {participants.map((p) => (
            <motion.div 
              key={p.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative aspect-video rounded-2xl border overflow-hidden group transition-colors ${
                isDark ? 'bg-purple-950 border-white/5' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <div className={`absolute inset-0 flex items-center justify-center ${
                isDark ? 'bg-gradient-to-br from-purple-900/50 to-purple-950' : 'bg-gray-200'
              }`}>
                {p.isMe && isVideoOn ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-2xl"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name[0]}
                  </div>
                )}
              </div>
              
              <div className={`absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 backdrop-blur-md rounded-lg border ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-gray-200'
              }`}>
                <span className={`text-[10px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                {!isMicOn && p.isMe && <MicOff className="w-3 h-3 text-red-400" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={`p-6 border-t transition-colors ${isDark ? 'border-white/5 bg-purple-950/50' : 'border-gray-100 bg-gray-50'}`}>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 rounded-full transition-all ${
              isMicOn 
                ? (isDark ? 'bg-purple-800 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-500') 
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-full transition-all ${
              isVideoOn 
                ? (isDark ? 'bg-purple-800 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-500') 
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button className={`p-3 rounded-full transition-all ${isDark ? 'bg-purple-800 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>
            <Monitor className="w-5 h-5" />
          </button>

          <button className="p-3 bg-red-600 text-white hover:bg-red-500 rounded-full transition-all shadow-lg shadow-red-600/20">
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingPanel;
