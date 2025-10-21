
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Search, Users, Scissors, Calendar, CreditCard, Star, Shield } from 'lucide-react';

const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // FAQ categories and their questions
  const faqCategories = [
    {
      id: 'general',
      name: 'General',
      icon: HelpCircle,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'booking',
      name: 'Booking',
      icon: Calendar,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'services',
      name: 'Services',
      icon: Scissors,
      color: 'bg-pink-100 text-pink-800'
    },
    {
      id: 'account',
      name: 'Account',
      icon: Users,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'reviews',
      name: 'Reviews',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-800'
    }
  ];

  const faqData = [
    // General Questions
    {
      id: 1,
      category: 'general',
      question: 'What is Bookang and how does it work?',
      answer: 'Bookang is a platform that connects customers with professional hairdressers and salons. You can browse salons, view services, read reviews, and book appointments all in one place. Simply create an account, search for salons in your area, and book your preferred time slot.',
      popular: true
    },
    {
      id: 2,
      category: 'general',
      question: 'Is Bookang available in my area?',
      answer: 'Bookang is currently available in major cities across the country and we\'re expanding rapidly. Use our salon search feature to see available options in your location. If we\'re not in your area yet, join our waitlist to be notified when we launch there.',
      popular: false
    },
    {
      id: 3,
      category: 'general',
      question: 'How do I contact customer support?',
      answer: 'You can reach our customer support team through multiple channels: email us at support@bookang.com, use the live chat feature on our website, or call us at (555) 123-4567. Our support hours are Monday-Friday 9AM-7PM and Saturday 10AM-4PM.',
      popular: false
    },

    // Booking Questions
    {
      id: 4,
      category: 'booking',
      question: 'How do I book an appointment?',
      answer: 'To book an appointment: 1) Log into your account, 2) Browse or search for salons, 3) Select your preferred salon and service, 4) Choose an available date and time, 5) Confirm your booking. You\'ll receive a confirmation email with all the details.',
      popular: true
    },
    {
      id: 5,
      category: 'booking',
      question: 'Can I cancel or reschedule my appointment?',
      answer: 'Yes, you can cancel or reschedule appointments up to 24 hours before your scheduled time without any fees. To do this, go to your dashboard, find the appointment, and click "Reschedule" or "Cancel". Cancellations within 24 hours may incur a fee depending on the salon\'s policy.',
      popular: true
    },
    {
      id: 6,
      category: 'booking',
      question: 'What happens if I\'m late for my appointment?',
      answer: 'If you\'re running late, please contact the salon directly as soon as possible. Most salons have a 15-minute grace period, but arriving late may result in a shortened service time or rescheduling to accommodate other clients. Each salon sets their own late policy.',
      popular: false
    },
    {
      id: 7,
      category: 'booking',
      question: 'Can I book multiple services at once?',
      answer: 'Absolutely! When booking, you can select multiple services from the same salon. The system will automatically calculate the total time needed and show you available slots that accommodate all your chosen services. You can also add services during your visit if time permits.',
      popular: false
    },

    // Payment Questions
    {
      id: 8,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, PayPal, Apple Pay, and Google Pay. Payment is typically processed after your service is completed, though some salons may require a deposit when booking.',
      popular: true
    },
    {
      id: 9,
      category: 'payments',
      question: 'When am I charged for my appointment?',
      answer: 'Most salons charge after your service is completed. However, some high-end salons or specialized treatments may require a deposit at booking time. You\'ll see the payment policy clearly stated before confirming your appointment.',
      popular: false
    },
    {
      id: 10,
      category: 'payments',
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'Refund policies vary by salon. If you\'re unsatisfied with your service, first speak with the salon manager. If the issue isn\'t resolved, contact our customer support team within 48 hours of your appointment. We work with salons to find fair solutions for service concerns.',
      popular: false
    },

    // Services Questions
    {
      id: 11,
      category: 'services',
      question: 'What types of services are available?',
      answer: 'Our partner salons offer a wide range of services including haircuts, hair coloring, highlights, hair treatments, styling, perms, extensions, and specialized services like keratin treatments. Service availability varies by salon, so check individual salon pages for their complete menu.',
      popular: true
    },
    {
      id: 12,
      category: 'services',
      question: 'How do I know which service is right for me?',
      answer: 'Many of our salons offer consultations to help determine the best services for your hair type and desired look. You can also read service descriptions, view before/after photos, and check reviews from other customers with similar hair types.',
      popular: false
    },
    {
      id: 13,
      category: 'services',
      question: 'Can I bring reference photos for my appointment?',
      answer: 'Absolutely! Bringing reference photos is encouraged and helps ensure you and your stylist are on the same page. You can also save inspiration photos in your Bookang profile to show your stylist during the consultation.',
      popular: false
    },

    // Account Questions
    {
      id: 14,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Creating an account is easy! Click "Register" on our homepage, choose whether you\'re a customer or hairdresser, enter your email and create a password. For hairdressers, you\'ll need to provide additional professional information. Verify your email address to activate your account.',
      popular: true
    },
    {
      id: 15,
      category: 'account',
      question: 'Can I update my profile information?',
      answer: 'Yes, you can update your profile information anytime by going to your account settings. You can change your contact information, preferences, and other details. Some changes may require email verification for security purposes.',
      popular: false
    },
    {
      id: 16,
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'To delete your account, go to Account Settings and scroll down to find the "Delete Account" option. Please note that this action is permanent and will remove all your booking history and saved preferences. Contact support if you need assistance.',
      popular: false
    },

    // Reviews Questions
    {
      id: 17,
      category: 'reviews',
      question: 'How do I leave a review?',
      answer: 'After your appointment is completed, you\'ll receive an email invitation to leave a review. You can also leave reviews by going to your appointment history in your dashboard and clicking "Leave Review" next to the completed appointment. Rate your experience and optionally add comments.',
      popular: true
    },
    {
      id: 18,
      category: 'reviews',
      question: 'Can I edit or delete my review?',
      answer: 'You can edit your review within 7 days of posting it by going to your review history in your account settings. After 7 days, reviews become permanent to maintain authenticity. If you have concerns about a review you left, contact our support team.',
      popular: false
    },
    {
      id: 19,
      category: 'reviews',
      question: 'Are reviews verified?',
      answer: 'Yes, all reviews on Bookang are from verified customers who have actually booked and completed appointments through our platform. This ensures authentic feedback and helps maintain the integrity of our review system.',
      popular: false
    }
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get popular questions
  const popularQuestions = faqData.filter(faq => faq.popular);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-blue-600">Questions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about Bookang, booking appointments, and using our platform
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
              className={selectedCategory === 'all' ? 'bg-blue-600' : ''}
            >
              All Questions
            </Button>
            {faqCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                  className={selectedCategory === category.id ? 'bg-blue-600' : ''}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Popular Questions (shown when no search/filter) */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="mb-12">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Star className="mr-2 h-5 w-5" />
                  Most Popular Questions
                </CardTitle>
                <CardDescription className="text-blue-700">
                  The questions our users ask most frequently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {popularQuestions.map((faq) => (
                    <AccordionItem key={faq.id} value={`popular-${faq.id}`}>
                      <AccordionTrigger className="text-left hover:text-blue-600">
                        <div className="flex items-center">
                          <Badge className="mr-3 bg-blue-100 text-blue-800 text-xs">
                            POPULAR
                          </Badge>
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        )}

        {/* All Questions */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery 
                ? `Search Results (${filteredFAQs.length})` 
                : selectedCategory === 'all' 
                  ? 'All Questions' 
                  : `${faqCategories.find(cat => cat.id === selectedCategory)?.name} Questions`
              }
            </h2>
          </div>

          {filteredFAQs.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => {
                    const category = faqCategories.find(cat => cat.id === faq.category);
                    const IconComponent = category?.icon || HelpCircle;
                    
                    return (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="px-6">
                        <AccordionTrigger className="text-left hover:text-blue-600">
                          <div className="flex items-center">
                            <div className="flex items-center mr-3">
                              <IconComponent className="h-4 w-4 mr-2 text-gray-500" />
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${category?.color || 'bg-gray-100 text-gray-800'}`}
                              >
                                {category?.name}
                              </Badge>
                            </div>
                            <span className="flex-1">{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 leading-relaxed ml-6">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Questions Found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any questions matching your search. Try different keywords or browse by category.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Contact Support */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-600 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">
                Still Need Help?
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Our support team is here to assist you with any questions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Live Chat</h4>
                    <p className="text-sm text-blue-100">Available 9AM-7PM</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email Support</h4>
                    <p className="text-sm text-blue-100">support@bookang.com</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone Support</h4>
                    <p className="text-sm text-blue-100">(555) 123-4567</p>
                  </div>
                </div>
              </div>
              
              <Button className="bg-white text-purple-600 hover:bg-gray-100">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default FAQSection;
