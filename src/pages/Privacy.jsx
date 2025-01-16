import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="btn-secondary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
          <p className="text-gray-700">
            Bayanihan Savings Circle ("we", "us", "our", or "Company") operates the Bayanihan Circle application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Information Collection and Use</h2>
          <p className="text-gray-700 mb-3">We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Personal Data:</strong> Name, email address, phone number, and other contact information</li>
            <li><strong>Financial Data:</strong> Contribution amounts, loan information, and payment history</li>
            <li><strong>Usage Data:</strong> Information about how you use our application</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Data Security</h2>
          <p className="text-gray-700">
            The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Data Retention</h2>
          <p className="text-gray-700">
            We will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Your Rights</h2>
          <p className="text-gray-700 mb-3">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">6. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at support@bayanihancirc.com
          </p>
        </section>

        <section className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Last updated: November 2025
          </p>
        </section>
      </div>
    </div>
  )
}

