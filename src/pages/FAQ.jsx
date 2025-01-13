import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'

export default function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const categories = [
    { value: 'all', label: 'All Questions' },
    { value: 'general', label: 'General' },
    { value: 'contributions', label: 'Contributions' },
    { value: 'loans', label: 'Loans' },
    { value: 'dividends', label: 'Dividends & Quota' },
    { value: 'yearend', label: 'Year-End Distribution' },
    { value: 'withdrawal', label: 'Withdrawals' }
  ]

  useEffect(() => {
    loadFAQs()
  }, [])

  const loadFAQs = async () => {
    try {
      const { data } = await db.getFAQs()
      setFaqs(data || [])
    } catch (error) {
      console.error('Error loading FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-100 p-4 rounded-full">
            <HelpCircle className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-600">
          Everything you need to know about Kapital+ Cooperative
        </p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <div className="card text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No questions found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <div key={faq.id} className="card">
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full flex items-start justify-between text-left"
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-lg mb-1">{faq.question}</h3>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {categories.find(c => c.value === faq.category)?.label || faq.category}
                  </span>
                </div>
                {expandedId === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedId === faq.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {faq.answer.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Contact Support */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">
            Can't find the answer you're looking for? Contact your group admin for assistance.
          </p>
          <button className="btn-primary">
            Contact Admin
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-1">
            {faqs.length}
          </div>
          <div className="text-sm text-gray-600">Total Questions</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-1">
            {new Set(faqs.map(f => f.category)).size}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-1">
            {filteredFAQs.length}
          </div>
          <div className="text-sm text-gray-600">Showing</div>
        </div>
      </div>
    </div>
  )
}

