import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Share2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  onPreviewInNewTab?: () => void;
}

export default function VideoPlayer({ 
  videoUrl, 
  title = "AI-Generated Product Video",
  onPreviewInNewTab 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Default 30 seconds
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${title.replace(/\s+/g, '_')}.mp4`;
      link.click();
    } else {
      toast({
        title: "Download available",
        description: "Video generation complete! Download will start shortly.",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: 'Check out this AI-generated product video!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard!",
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && currentTime < duration) {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      } else if (currentTime >= duration) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <i className="fas fa-video text-accent mr-2"></i>
        {title}
      </h4>
      
      {/* Video Preview Area */}
      <div className="bg-gray-900 rounded-lg aspect-video mb-4 flex items-center justify-center relative overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="text-center text-white">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary ml-1" />
              </div>
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
            </div>
            <p className="text-lg font-medium">{title}</p>
            <p className="text-sm opacity-80 mt-1">30 seconds • With background music</p>
            <p className="text-xs opacity-60 mt-2">Generated with AI • Ready for download</p>
          </div>
        )}
        
        {/* Play/Pause Overlay */}
        <button
          data-testid="button-video-play"
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
        >
          <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-4">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>{Math.floor(currentTime)}s</span>
        <span>{Math.floor(duration)}s</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {onPreviewInNewTab && (
          <Button
            data-testid="button-preview-new-tab"
            onClick={onPreviewInNewTab}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview in New Tab
          </Button>
        )}
        
        <Button
          data-testid="button-download-video"
          onClick={handleDownload}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Video
        </Button>
        
        <Button
          data-testid="button-share-video"
          onClick={handleShare}
          variant="outline"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
