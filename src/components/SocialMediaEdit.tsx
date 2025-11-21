import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialMediaEditProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  onSave: (data: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  }) => void;
}

export const SocialMediaEdit = ({ isOpen, onClose, initialData, onSave }: SocialMediaEditProps) => {
  const [socialLinks, setSocialLinks] = useState({
    instagram: initialData?.instagram || '',
    facebook: initialData?.facebook || '',
    twitter: initialData?.twitter || '',
    tiktok: initialData?.tiktok || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({
          instagram_url: socialLinks.instagram || null,
          facebook_url: socialLinks.facebook || null,
          twitter_url: socialLinks.twitter || null,
          tiktok_url: socialLinks.tiktok || null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      onSave(socialLinks);
      toast({
        title: "Success",
        description: "Social media links updated successfully!"
      });
      onClose();
    } catch (error) {
      console.error('Error saving social media links:', error);
      toast({
        title: "Error",
        description: "Failed to save social media links. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Social Media Links</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/yourprofile"
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/yourpage"
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-sky-500" />
              Twitter/X
            </Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/yourhandle"
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525 2.016c-.374-.065-1.18-.056-1.18-.056s-.054-.79-.423-1.296C10.65.384 10.306.096 9.68.024 9.374-.016 8.89.024 8.89.024s.02.79.374 1.296c.294.424.619.712 1.245.784zm3.624 1.2c-.334-.065-1.064-.056-1.064-.056s-.048-.71-.382-1.17C14.493 1.67 14.2 1.43 13.688 1.37c-.276-.04-.689.01-.689.01s.018.71.338 1.17c.266.383.559.623 1.048.683z" />
              </svg>
              TikTok
            </Label>
            <Input
              id="tiktok"
              placeholder="https://tiktok.com/@yourhandle"
              value={socialLinks.tiktok}
              onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Links'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};