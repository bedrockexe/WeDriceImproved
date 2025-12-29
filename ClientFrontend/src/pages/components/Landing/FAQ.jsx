import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
const faqs = [
  {
    question: 'What documents do I need to rent a car?',
    answer:
      "You'll need a valid driver's license, a credit card in your name, and a form of identification (passport or ID card). International renters may need additional documentation.",
  },
  {
    question: 'Can I cancel my booking?',
    answer:
      'Yes, you can cancel your booking. Free cancellation is available up to 48 hours before your scheduled pickup. Cancellations made within 48 hours may incur a fee.',
  },
  {
    question: 'Is insurance included in the rental price?',
    answer:
      'Basic insurance is included in all our rentals. Additional coverage options are available at an extra cost. We recommend reviewing the insurance details before finalizing your booking.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), as well as digital payment methods like Apple Pay and Google Pay. Cash payments are not accepted.',
  },
  {
    question: 'Do you offer delivery or pickup services?',
    answer:
      'Yes, we offer both delivery and pickup services at select locations for an additional fee. This service must be arranged at least 24 hours in advance.',
  },
  {
    question: 'Is there a minimum age requirement?',
    answer:
      'Yes, renters must be at least 21 years old. Drivers under 25 may be subject to a young driver surcharge. Some specialty vehicles require drivers to be 25 or older.',
  },
]
export function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  return (
    <section className="py-16 bg-gray-50" id='faq'>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our rental process and
            services.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white"
            >
              <button
                className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span
                  className={`font-medium text-lg ${openIndex === index ? 'text-[#1AB759]' : 'text-gray-800'}`}
                >
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUpIcon size={20} className="text-[#1AB759]" />
                ) : (
                  <ChevronDownIcon size={20} className="text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="p-4 pt-0 border-t border-gray-100">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
