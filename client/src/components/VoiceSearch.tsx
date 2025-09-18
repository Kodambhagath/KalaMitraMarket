import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  placeholder?: string;
}

export default function VoiceSearch({ onResult, placeholder = "Try saying something..." }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice search error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onResult, toast]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice search.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <Button
      data-testid="button-voice-search"
      onClick={toggleListening}
      variant={isListening ? "destructive" : "secondary"}
      size="sm"
      className={`transition-all duration-200 ${isListening ? 'animate-pulse' : ''}`}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      <span className="ml-2 hidden sm:inline">
        {isListening ? 'Listening...' : 'Voice Search'}
      </span>
    </Button>
  );
}
