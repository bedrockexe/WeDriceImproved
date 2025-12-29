import React from 'react'
import { ClipboardIcon, CarIcon, CreditCardIcon } from 'lucide-react'
const steps = [
  {
    icon: <ClipboardIcon size={32} className="text-white" />,
    number: 1,
    title: 'Sign Up',
    description: 'Create your account in less than a minute.',
  },
  {
    icon: <CarIcon size={32} className="text-white" />,
    number: 2,
    title: 'Choose a Car',
    description: 'Browse our fleet and select your preferred ride.',
  },
  {
    icon: <CreditCardIcon size={32} className="text-white" />,
    number: 3,
    title: 'Book & Drive',
    description: 'Pay online securely and hit the road.',
  },
]
export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Renting a car with WeDrive is simple and straightforward.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-0 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center z-10 md:w-1/3 px-4"
            >
              <div className="bg-[#1AB759] w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-1/4 w-1/2 h-0.5 bg-[#1AB759]"></div>
        </div>
      </div>
    </section>
  )
}
