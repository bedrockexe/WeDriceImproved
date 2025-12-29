import React from 'react'
import {
  DollarSignIcon,
  WrenchIcon,
  HeadphonesIcon,
  MapPinIcon,
} from 'lucide-react'
const features = [
  {
    icon: <DollarSignIcon size={28} className="text-[#1AB759]" />,
    title: 'Affordable Rates',
    description:
      'Competitive pricing with no hidden fees. Get the best value for your money.',
  },
  {
    icon: <WrenchIcon size={28} className="text-[#1AB759]" />,
    title: 'Well-Maintained Cars',
    description:
      'Our fleet is regularly serviced and cleaned to ensure your safety and comfort.',
  },
  {
    icon: <HeadphonesIcon size={28} className="text-[#1AB759]" />,
    title: '24/7 Customer Support',
    description:
      'Our team is always available to assist you with any questions or concerns.',
  },
  {
    icon: <MapPinIcon size={28} className="text-[#1AB759]" />,
    title: 'Easy Pickup & Drop-off',
    description:
      'Convenient locations and flexible hours to suit your travel schedule.',
  },
]
export function WhyChooseUs() {
  return (
    <section className="py-16 bg-white" id='about'>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Why Choose WeDrive?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best car rental experience with
            quality service and customer satisfaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 text-center transition-transform duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
