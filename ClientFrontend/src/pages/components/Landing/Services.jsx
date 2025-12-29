import { Gauge, Users, Sparkles, Zap, Wrench } from "lucide-react"

export default function Services() {
  const services = [
    {
      id: 1,
      icon: Gauge,
      title: "Unli Mileage",
    },
    {
      id: 2,
      icon: Users,
      title: "Self Drive / Driver",
    },
    {
      id: 3,
      icon: Sparkles,
      title: "Clean and Sanitized",
    },
    {
      id: 4,
      icon: Zap,
      title: "RFID - Ready",
    },
    {
      id: 5,
      icon: Wrench,
      title: "Well Maintained",
    },
  ]

  return (
    <section className="bg-gradient-to-r from-green-600 to-green-700 py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <p className="text-white text-lg mb-4">"You say, we drive"</p>
            <h2 className="text-4xl font-bold text-white mb-6">WeDrive Car Rental Services</h2>
            <p className="text-white text-lg leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. At turpis at sed ornare fusce cursus sed orci elementum. asdadasd
              jashd urea
            </p>
          </div>

          {/* Right Services Grid */}
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => {
              const Icon = service.icon
                return (
                <div
                  key={service.id}
                  className="bg-white rounded-lg p-4 flex items-center gap-3 hover:bg-lime-100 hover:shadow-lg transition-all"
                >
                  <Icon size={24} className="text-green-600 flex-shrink-0" />
                  <span className="font-medium text-gray-800">{service.title}</span>
                </div>
                )
            })}
          </div>
        </div>
      </div>

      {/* Decorative Squares */}
      <div className="absolute bottom-10 left-10 w-8 h-8 bg-green-500 rounded opacity-50"></div>
      <div className="absolute bottom-20 left-20 w-8 h-8 bg-green-500 rounded opacity-50"></div>
    </section>
  )
}
