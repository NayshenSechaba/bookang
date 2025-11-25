import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export const BusinessSettings = ({ isOpen, onClose }: BusinessSettingsProps) => {
  const [businessData, setBusinessData] = useState({
    business_phone: '',
    business_email: '',
    business_address: '',
    business_city: '',
    business_province: '',
    business_postal_code: '',
    latitude: '',
    longitude: ''
  });
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '13:00', closed: false },
    sunday: { open: '00:00', close: '00:00', closed: true }
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchBusinessSettings();
    }
  }, [isOpen]);

  const fetchBusinessSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('business_phone, business_email, business_address, business_city, business_province, business_postal_code, latitude, longitude, business_hours')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setBusinessData({
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          business_address: data.business_address || '',
          business_city: data.business_city || '',
          business_province: data.business_province || '',
          business_postal_code: data.business_postal_code || '',
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || ''
        });
        if (data.business_hours) {
          setBusinessHours(data.business_hours as BusinessHours);
        }
      }
    } catch (error) {
      console.error('Error fetching business settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({
          business_phone: businessData.business_phone || null,
          business_email: businessData.business_email || null,
          business_address: businessData.business_address || null,
          business_city: businessData.business_city || null,
          business_province: businessData.business_province || null,
          business_postal_code: businessData.business_postal_code || null,
          latitude: businessData.latitude ? parseFloat(businessData.latitude) : null,
          longitude: businessData.longitude ? parseFloat(businessData.longitude) : null,
          business_hours: businessHours
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business settings updated successfully!"
      });
      onClose();
    } catch (error) {
      console.error('Error saving business settings:', error);
      toast({
        title: "Error",
        description: "Failed to save business settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue" />
              Contact Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_phone">Business Phone</Label>
                <Input
                  id="business_phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="+27 12 345 6789"
                  value={businessData.business_phone}
                  onChange={(e) => setBusinessData({ ...businessData, business_phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_email">Business Email</Label>
                <Input
                  id="business_email"
                  type="email"
                  inputMode="email"
                  placeholder="contact@business.com"
                  value={businessData.business_email}
                  onChange={(e) => setBusinessData({ ...businessData, business_email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue" />
              Business Address
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_address">Street Address</Label>
                <Input
                  id="business_address"
                  placeholder="123 Main Street"
                  value={businessData.business_address}
                  onChange={(e) => setBusinessData({ ...businessData, business_address: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_city">City</Label>
                  <Input
                    id="business_city"
                    placeholder="Johannesburg"
                    value={businessData.business_city}
                    onChange={(e) => setBusinessData({ ...businessData, business_city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_province">Province</Label>
                  <Input
                    id="business_province"
                    placeholder="Gauteng"
                    value={businessData.business_province}
                    onChange={(e) => setBusinessData({ ...businessData, business_province: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_postal_code">Postal Code</Label>
                  <Input
                    id="business_postal_code"
                    type="text"
                    inputMode="numeric"
                    placeholder="2000"
                    value={businessData.business_postal_code}
                    onChange={(e) => setBusinessData({ ...businessData, business_postal_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (optional)</Label>
                  <Input
                    id="latitude"
                    placeholder="-26.2041"
                    value={businessData.latitude}
                    onChange={(e) => setBusinessData({ ...businessData, latitude: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (optional)</Label>
                  <Input
                    id="longitude"
                    placeholder="28.0473"
                    value={businessData.longitude}
                    onChange={(e) => setBusinessData({ ...businessData, longitude: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue" />
              Business Hours
            </h3>
            
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-4 py-2 border-b border-blue/10 last:border-0">
                  <div className="w-28">
                    <span className="font-medium capitalize">{day}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={businessHours[day].open}
                      onChange={(e) => setBusinessHours({
                        ...businessHours,
                        [day]: { ...businessHours[day], open: e.target.value }
                      })}
                      disabled={businessHours[day].closed}
                      className="w-32"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={businessHours[day].close}
                      onChange={(e) => setBusinessHours({
                        ...businessHours,
                        [day]: { ...businessHours[day], close: e.target.value }
                      })}
                      disabled={businessHours[day].closed}
                      className="w-32"
                    />
                  </div>
                  
                  <Button
                    variant={businessHours[day].closed ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => setBusinessHours({
                      ...businessHours,
                      [day]: { ...businessHours[day], closed: !businessHours[day].closed }
                    })}
                  >
                    {businessHours[day].closed ? 'Open' : 'Closed'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue hover:opacity-90 text-blue-foreground">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};