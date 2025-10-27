import { useState } from 'react'

export default function Home() {
  const [repo, setRepo] = useState('')
  const [status, setStatus] = useState('Idle')
  const [result, setResult] = useState(null)

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL

  const submit = async () => {
    if (!repo) return alert('Paste a GitHub repo or PR URL')
    setStatus('Queueing...')
    try {
      const res = await fetch(`${BACKEND}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_BLAI_API_KEY
        },
        body: JSON.stringify({ repo_url: repo })
      })
      const j = await res.json()
      setStatus('Queued — ' + j.review_id)
      poll(j.review_id)
    } catch (e) {
      console.error(e)
      setStatus('Error: ' + e.message)
    }
  }

  const poll = async (id) => {
    setStatus('Analyzing...')
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      const r = await fetch(`${BACKEND}/artifacts/${id}`)
      if (r.status === 200) {
        const json = await r.json()
        setResult(json)
        setStatus('Completed')
        return
      }
    }
    setStatus('Timeout')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4 text-sky-700">BLAI CodeLens</h1>
        <p className="text-gray-600 mb-4">
          Paste a public GitHub repo or pull request URL. This agent will clone
          the repo, run static analysis and LLM-based review, and show structured feedback.
        </p>

        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />
        <button
          onClick={submit}
          className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition"
        >
          Analyze
        </button>

        <div className="mt-4">
          <p>Status: <strong>{status}</strong></p>
        </div>

        <pre className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-xl text-sm overflow-auto max-h-[400px]">
          {result ? JSON.stringify(result, null, 2) : 'No results yet'}
        </pre>
      </div>
    </main>
  )
}
