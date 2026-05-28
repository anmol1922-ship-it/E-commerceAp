export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        About Bisleri Vasai
      </h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            India's Most Trusted Water Brand
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Bisleri International has been delivering pure, safe drinking water
            to millions of Indians since 1969. Our water undergoes a rigorous
            10-step purification process and 114 quality tests to ensure you get
            the purest water every time.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Water Quality Standards
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>10-step purification process</li>
            <li>114 quality tests at every stage</li>
            <li>BIS certified (IS 14543)</li>
            <li>FDA approved packaging materials</li>
            <li>Ozone treated for bacteria-free water</li>
            <li>
              TDS maintained between 80-120 ppm for optimal mineral balance
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Delivery in Vasai
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We provide same-day delivery across Vasai West, Vasai East,
            Nalasopara, and surrounding areas (pincodes 401201–401305). Our
            delivery fleet ensures your water reaches you fresh and on time.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">4</p>
              <p className="text-sm text-gray-600">Delivery Slots Daily</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">₹500+</p>
              <p className="text-sm text-gray-600">Free Delivery</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">COD</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Contact Us
          </h2>
          <div className="text-gray-600 space-y-2">
            <p>📞 Phone: +91 98765 43210</p>
            <p>📧 Email: order@bisleri-vasai.com</p>
            <p>
              📍 Address: Bisleri Water Depot, Vasai West, Maharashtra 401202
            </p>
            <p>🕐 Timings: Mon–Sat, 8 AM – 9 PM</p>
          </div>
        </section>
      </div>
    </div>
  );
}
