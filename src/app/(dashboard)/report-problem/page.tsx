// app/settings/report-problem/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ReportProblemPage() {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    contactEmail: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Insert problem report
      const { error } = await supabase
        .from('problem_reports')
        .insert({
          subject: formData.subject,
          description: formData.description,
          contact_email: formData.contactEmail || user?.email,
          user_id: user?.id,
          status: 'open'
        })

      if (error) throw error

      toast.success('Problem reported successfully!')
      router.push('/settings')
    } catch (error) {
      console.error('Error reporting problem:', error)
      toast.error('Failed to submit report', {
        description: error instanceof Error ? error.message : 'Please try again later'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Report a Problem</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Let us know what issues you&apos;re experiencing and we&apos;ll help you resolve them.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="Briefly describe the issue"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Please provide detailed information about the problem..."
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            disabled={isSubmitting}
            className="min-h-[150px]"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Include any error messages, steps to reproduce, and what you expected to happen.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email (optional)</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="Where should we contact you?"
            value={formData.contactEmail}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If different from your account email
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </div>
  )
}