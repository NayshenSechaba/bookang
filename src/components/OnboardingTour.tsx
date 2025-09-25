import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour = ({ isVisible, onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [highlightElement, setHighlightElement] = useState<string | null>(null);

  const tourSteps = [
    {
      id: 'portfolio',
      title: 'Step 1: Complete Your Profile',
      message: 'This is the most important step! Click here to set your business name, location, and operating hours. **This is also where you will upload your business logo or profile photo to attract clients.**',
      target: '[data-tour="portfolio"]',
      position: 'bottom'
    },
    {
      id: 'services',
      title: 'Step 2: Add Your Services',
      message: 'This is where you list everything you offer. Add your services, set their duration, and price so customers know exactly what to book.',
      target: '[data-tour="services"]',
      position: 'bottom'
    },
    {
      id: 'bookings',
      title: 'Step 3: Manage Your Bookings',
      message: 'Once customers start booking you, all your appointments will appear right here. You\'ll be able to see your schedule at a glance.',
      target: '[data-tour="bookings"]',
      position: 'bottom'
    }
  ];

  const handleStartTour = () => {
    setShowWelcome(false);
    setCurrentStep(0);
    highlightStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      highlightStep(nextStep);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('user_id', user.user.id);
      }
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
    }
    
    setHighlightElement(null);
    onComplete();
  };

  const handleSkip = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('user_id', user.user.id);
      }
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
    }
    
    setHighlightElement(null);
    onSkip();
  };

  const highlightStep = (stepIndex: number) => {
    const step = tourSteps[stepIndex];
    if (step) {
      setHighlightElement(step.target);
      // Add highlighting effect to the target element
      setTimeout(() => {
        const element = document.querySelector(step.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (highlightElement) {
      const element = document.querySelector(highlightElement);
      if (element) {
        element.classList.add('onboarding-highlight');
      }
    }

    return () => {
      // Clean up highlighting
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [highlightElement]);

  if (!isVisible) return null;

  if (showWelcome) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Welcome to Bookang! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-base mt-4">
              Let's get you ready to accept bookings in just a few quick steps. This tour will show you the most important features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip for now
            </Button>
            <Button onClick={handleStartTour} className="flex-1">
              Start Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const currentTourStep = tourSteps[currentStep];
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />
      
      {/* Tour Step Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md bg-white shadow-xl pointer-events-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {currentStep + 1}
                </div>
                <h3 className="text-lg font-semibold">{currentTourStep?.title}</h3>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {currentTourStep?.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button onClick={handleNextStep}>
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Modal */}
      {currentStep >= tourSteps.length && (
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                You're All Set! ✅
              </DialogTitle>
              <DialogDescription className="text-center text-base mt-4">
                That's it for the basics. You are now ready to finish your profile and start accepting bookings. Welcome aboard!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleComplete} className="w-full">
                Finish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </>
  );
};

export default OnboardingTour;