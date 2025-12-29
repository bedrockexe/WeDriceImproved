import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQSection = () => {
  const faqs = [{
    question: 'How can I cancel my booking?',
    answer: 'You can cancel your booking through the "My Bookings" section. Select the booking you wish to cancel and click the "Cancel" button. Please note that cancellations within 24 hours of pickup may incur a fee.'
  }, {
    question: 'What documents are required for car pickup?',
    answer: "You will need a valid driver's license, a credit card in the renter's name, and a valid ID. International renters may need to provide additional documentation."
  }, {
    question: 'Can I rent a car without a credit card?',
    answer: 'While we primarily accept credit cards, some locations may accept debit cards with additional verification. Please contact our support team for specific location policies.'
  }];
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
            <button className="flex justify-between items-center w-full text-left py-2 focus:outline-none" onClick={() => toggleFAQ(index)}>
              <span className="font-medium text-gray-800">{faq.question}</span>
              {openIndex === index ? <ChevronUpIcon size={18} className="text-gray-500" /> : <ChevronDownIcon size={18} className="text-gray-500" />}
            </button>
            {openIndex === index && <div className="mt-1 text-sm text-gray-600 pb-2">
                {faq.answer}
              </div>}
          </div>)}
      </div>
      <div className="mt-4 text-center">
        <Link to="/dashboard/support" className="text-green-500 text-sm font-medium hover:text-green-600">
          View All FAQs
        </Link>
      </div>
    </div>;
};
export default FAQSection;