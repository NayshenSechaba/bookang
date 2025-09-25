import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CreditCard,
  Mail,
  Home
} from 'lucide-react';

interface BookingConfirmationProps {
  bookingDetails: {
    service: string;
    stylist: string;
    date: string;
    time: string;
    cost: string;
    depositAmount: string;
    remainingAmount: string;
    salon: string;
    bookingId: string;
  };
  onGoHome: () => void;
  onViewBookings: () => void;
}

const BookingConfirmation = ({ bookingDetails, onGoHome, onViewBookings }: BookingConfirmationProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800 mb-2">
              Your Booking is Confirmed!
            </CardTitle>
            <CardDescription className="text-lg">
              Thank you! We've received your deposit. A confirmation has been sent to your email address. 
              <span className="font-medium text-primary"> {bookingDetails.stylist}</span> is looking forward to seeing you.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Booking Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Service Provider:</span>
                    <span className="ml-2 font-medium">{bookingDetails.stylist}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="ml-2 font-medium">{bookingDetails.salon}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="ml-2 font-medium">{bookingDetails.date}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <span className="ml-2 font-medium">{bookingDetails.time}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Service:</span>
                  <Badge variant="secondary">{bookingDetails.service}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Booking ID:</span>
                  <span className="font-mono">{bookingDetails.bookingId}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-4 flex items-center text-blue-800">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Summary
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Full Service Price:</span>
                  <span className="font-medium">{bookingDetails.cost}</span>
                </div>
                <div className="flex justify-between items-center text-green-700">
                  <span className="text-sm">✓ Deposit Paid Today:</span>
                  <span className="font-medium">{bookingDetails.depositAmount}</span>
                </div>
                <div className="flex justify-between items-center text-orange-700 pt-2 border-t border-blue-200">
                  <span className="text-sm">Amount Due at Appointment:</span>
                  <span className="font-medium">{bookingDetails.remainingAmount}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-lg mb-3 text-yellow-800">What's Next?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Check your email for detailed confirmation and directions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Add the appointment to your calendar
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Bring the remaining {bookingDetails.remainingAmount} to your appointment
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Contact {bookingDetails.stylist} if you need to reschedule
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={onViewBookings}
                className="flex-1"
                variant="default"
              >
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
              
              <Button 
                onClick={onGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;