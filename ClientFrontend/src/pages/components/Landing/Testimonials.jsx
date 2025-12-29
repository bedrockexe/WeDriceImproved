import React from 'react'
import { StarIcon } from 'lucide-react'
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    photo: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 5,
    quote:
      "Booking was fast and the car was spotless. Great service! I'll definitely use WeDrive for my next trip.",
  },
  {
    id: 2,
    name: 'Michael Chen',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    quote:
      'The whole process was seamless from start to finish. The car was exactly as described and pickup was quick.',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    photo: 'https://randomuser.me/api/portraits/women/23.jpg',
    rating: 4,
    quote:
      'Customer service was exceptional. They helped me choose the perfect car for my family vacation.',
  },
]
export function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers
            have to say.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-xl p-6 shadow-sm transition-transform duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {testimonial.name}
                  </h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        size={16}
                        fill={i < testimonial.rating ? '#FFD700' : 'none'}
                        stroke={i < testimonial.rating ? '#FFD700' : '#CBD5E0'}
                        className="mr-1"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="text-gray-600 italic">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
