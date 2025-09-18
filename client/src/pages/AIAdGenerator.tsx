import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import VoiceSearch from '@/components/VoiceSearch';
import VideoPlayer from '@/components/VideoPlayer';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Copy, 
  Download, 
  Share2,
  ArrowLeft,
  Wand2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface GeneratedContent {
  script: {
    tagline: string;
    description: string;
  };
  images: string[];
  videoUrl?: string;
}

export default function AIAdGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [generationOptions, setGenerationOptions] = useState({
    script: true,
    images: true,
    video: true,
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const generateContentMutation = useMutation({
    mutationFn: async (data: { prompt: string; options: typeof generationOptions }) => {
      const response = await apiRequest('POST', '/api/ai/generate-ad', {
        prompt: data.prompt,
        productId: 'sample-product-id', // In real app, this would come from context
        userId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Content generated!",
        description: "Your AI-powered marketing content is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVoiceResult = (transcript: string) => {
    setPrompt(transcript);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing description",
        description: "Please describe your product to generate content.",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate({
      prompt: prompt.trim(),
      options: generationOptions,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const downloadImages = () => {
    if (generatedContent?.images) {
      generatedContent.images.forEach((imageUrl, index) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `marketing-image-${index + 1}.jpg`;
        link.click();
      });
      toast({
        title: "Download started",
        description: "Marketing images are being downloaded.",
      });
    }
  };

  const shareContent = async () => {
    if (navigator.share && generatedContent) {
      try {
        await navigator.share({
          title: 'AI-Generated Marketing Content',
          text: `Check out this AI-generated content: ${generatedContent.script.tagline}`,
          url: window.location.href,
        });
      } catch (error) {
        copyToClipboard(window.location.href);
      }
    } else {
      copyToClipboard(window.location.href);
    }
  };

  const openVideoPreview = () => {
    window.open('/video-preview', '_blank');
  };

  if (!currentUser || currentUser.role !== 'shopkeeper') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">AI Ad Generator is only available for artisans.</p>
          <Button onClick={() => setLocation('/auth')}>Login as Artisan</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-foreground flex items-center">
                  <Bot className="w-8 h-8 mr-3 text-primary" />
                  AI Ad Generator
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Create professional marketing content for your products using AI
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Input Section */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-primary w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Describe Your Product</h3>
                  <div className="relative">
                    <Textarea
                      data-testid="textarea-product-description"
                      rows={4}
                      placeholder="e.g., My product is a beautiful ceramic pot with traditional blue and white patterns, perfect for home decoration..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="pr-16 resize-none"
                    />
                    <div className="absolute bottom-3 right-3">
                      <VoiceSearch 
                        onResult={handleVoiceResult}
                        placeholder="Describe your product using voice"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 Try voice commands: "Create ad for pot" or "Make poster for Diwali sale on lamps"
                  </p>
                </div>
              </div>
            </div>

            {/* Generation Options */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className={`cursor-pointer transition-colors ${generationOptions.script ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Checkbox
                      checked={generationOptions.script}
                      onCheckedChange={(checked) => 
                        setGenerationOptions(prev => ({ ...prev, script: !!checked }))
                      }
                      data-testid="checkbox-script"
                    />
                    <FileText className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Ad Script & Tagline</h3>
                  <p className="text-muted-foreground text-sm">
                    Generate compelling copy and taglines for your products
                  </p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-colors ${generationOptions.images ? 'border-secondary bg-secondary/5' : 'hover:border-secondary/50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Checkbox
                      checked={generationOptions.images}
                      onCheckedChange={(checked) => 
                        setGenerationOptions(prev => ({ ...prev, images: !!checked }))
                      }
                      data-testid="checkbox-images"
                    />
                    <ImageIcon className="text-secondary w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Marketing Images</h3>
                  <p className="text-muted-foreground text-sm">
                    Create professional product photos and promotional graphics
                  </p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-colors ${generationOptions.video ? 'border-accent bg-accent/5' : 'hover:border-accent/50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Checkbox
                      checked={generationOptions.video}
                      onCheckedChange={(checked) => 
                        setGenerationOptions(prev => ({ ...prev, video: !!checked }))
                      }
                      data-testid="checkbox-video"
                    />
                    <Video className="text-accent w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Promotional Video</h3>
                  <p className="text-muted-foreground text-sm">
                    Create engaging video ads with music and text overlays
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <Button
                data-testid="button-generate-content"
                onClick={handleGenerate}
                disabled={generateContentMutation.isPending || !prompt.trim()}
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {generateContentMutation.isPending ? 'Generating...' : 'Generate AI Content'}
              </Button>
            </div>

            {/* Results Section */}
            {generatedContent && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground">Generated Content</h3>
                
                {/* Ad Script */}
                {generationOptions.script && generatedContent.script && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="text-primary w-5 h-5 mr-2" />
                        Ad Script & Tagline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-md p-4 mb-4">
                        <p className="text-foreground font-medium mb-2" data-testid="text-generated-tagline">
                          "{generatedContent.script.tagline}"
                        </p>
                        <p className="text-muted-foreground text-sm" data-testid="text-generated-description">
                          {generatedContent.script.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${generatedContent.script.tagline}\n\n${generatedContent.script.description}`)}
                        data-testid="button-copy-script"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Generated Images */}
                {generationOptions.images && generatedContent.images && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ImageIcon className="text-secondary w-5 h-5 mr-2" />
                        Marketing Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {generatedContent.images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Marketing image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                            data-testid={`img-generated-${index}`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadImages}
                          data-testid="button-download-images"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={shareContent}
                          data-testid="button-share-images"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Images
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Generated Video */}
                {generationOptions.video && (
                  <VideoPlayer
                    videoUrl={generatedContent.videoUrl}
                    title="AI-Generated Product Video"
                    onPreviewInNewTab={openVideoPreview}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
