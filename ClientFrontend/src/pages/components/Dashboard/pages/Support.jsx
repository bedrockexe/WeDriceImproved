import React, { useState } from 'react';
import { ChevronDownIcon, PhoneIcon, MailIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
const Support = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const faqs = [{
    question: 'How do I book a car?',
    answer: 'You can book a car by browsing our Available Cars page, selecting your desired vehicle, choosing your pickup and return dates, and completing the booking process. You will receive a confirmation email once your booking is confirmed.'
  }, {
    question: 'What documents do I need to rent a car?',
    answer: "You need a valid driver's license, a credit card in your name, and proof of insurance. International renters may also need an International Driving Permit (IDP) depending on their country of origin."
  }, {
    question: 'Can I modify or cancel my booking?',
    answer: 'Yes, you can modify or cancel your booking from the My Bookings page. Cancellation policies vary depending on how far in advance you cancel. Free cancellation is available up to 24 hours before pickup.'
  }, {
    question: 'What is your fuel policy?',
    answer: 'We operate on a full-to-full fuel policy. You will receive the car with a full tank and should return it with a full tank. If you return the car without refueling, a refueling charge plus a service fee will be applied.'
  }, {
    question: 'Is insurance included in the rental price?',
    answer: 'Basic insurance is included in all our rental prices. However, you can purchase additional coverage options like collision damage waiver (CDW) or theft protection for extra peace of mind.'
  }, {
    question: 'What happens if I return the car late?',
    answer: 'Late returns are subject to additional charges. If you know you will be late, please contact us as soon as possible. We charge by the hour for delays up to 2 hours, and a full day rate for delays beyond that.'
  }, {
    question: 'Can I add an additional driver?',
    answer: 'Yes, you can add additional drivers during the booking process or at pickup. Additional drivers must meet the same requirements as the primary driver and there may be an additional fee.'
  }, {
    question: 'Do you offer long-term rentals?',
    answer: 'Yes, we offer special rates for long-term rentals (7 days or more). Contact our support team for custom quotes and long-term rental packages.'
  }];
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Your message has been sent! We will get back to you shortly.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Support & FAQs
      </h1>
      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <PhoneIcon size={24} className="text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Phone Support</h3>
          <p className="text-sm text-gray-500 mb-2">Mon-Fri, 8am-8pm EST</p>
          <a href="tel:+15551234567" className="text-green-600 hover:text-green-700 font-medium">
            +1 (555) 123-4567
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MailIcon size={24} className="text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Email Support</h3>
          <p className="text-sm text-gray-500 mb-2">Response within 24 hours</p>
          <a href="mailto:support@WeDrive.com" className="text-green-600 hover:text-green-700 font-medium">
            support@WeDrive.com
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircleIcon size={24} className="text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Live Chat</h3>
          <p className="text-sm text-gray-500 mb-2">Available 24/7</p>
          <button className="text-green-600 hover:text-green-700 font-medium">
            Start Chat
          </button>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => <div key={index} className="border border-gray-200 rounded-lg">
              <button onClick={() => setOpenFAQ(openFAQ === index ? null : index)} className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-800 text-left">
                  {faq.question}
                </span>
                <ChevronDownIcon size={20} className={`text-gray-500 transition-transform ${openFAQ === index ? 'transform rotate-180' : ''}`} />
              </button>
              {openFAQ === index && <div className="px-5 pb-4 pt-2">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>}
            </div>)}
        </div>
      </div>
      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Send us a message
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="john@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="How can we help you?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Please describe your issue or question..." />
          </div>
          <button type="submit" className="flex items-center px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
            <SendIcon size={18} className="mr-2" />
            Send Message
          </button>
        </form>
      </div>
    </div>;
};
export default Support;