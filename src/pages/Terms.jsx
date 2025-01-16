import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="btn-secondary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>

      <div className="card space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Agreement to Terms</h2>
          <p className="text-gray-700">
            By accessing and using the Bayanihan Circle application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Use License</h2>
          <p className="text-gray-700 mb-3">
            Permission is granted to temporarily download one copy of the materials (information or software) on Bayanihan Circle for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the application</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Disclaimer</h2>
          <p className="text-gray-700">
            The materials on Bayanihan Circle are provided on an 'as is' basis. Bayanihan Circle makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Limitations</h2>
          <p className="text-gray-700">
            In no event shall Bayanihan Circle or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Bayanihan Circle.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Accuracy of Materials</h2>
          <p className="text-gray-700">
            The materials appearing on Bayanihan Circle could include technical, typographical, or photographic errors. Bayanihan Circle does not warrant that any of the materials on its application are accurate, complete, or current. Bayanihan Circle may make changes to the materials contained on its application at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">6. Links</h2>
          <p className="text-gray-700">
            Bayanihan Circle has not reviewed all of the sites linked to its application and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Bayanihan Circle of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">7. Modifications</h2>
          <p className="text-gray-700">
            Bayanihan Circle may revise these terms of service for its application at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">8. Governing Law</h2>
          <p className="text-gray-700">
            These terms and conditions are governed by and construed in accordance with the laws of the Philippines, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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

