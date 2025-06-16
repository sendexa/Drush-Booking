'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle,  Phone, Mail } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function ReportProblem() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: '',
    bookingId: '',
    priority: 'medium'
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create support ticket
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          type: formData.type,
          subject: formData.subject,
          description: formData.description,
          booking_id: formData.bookingId || null,
          priority: formData.priority,
          status: 'open',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Support ticket submitted successfully')
      router.push('/support/tickets')
    } catch (error) {
      console.error('Error submitting support ticket:', error)
      toast.error('Failed to submit support ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Report a Problem</h1>
        <p className="text-muted-foreground">
          Let us know if you&apos;re experiencing any issues with your booking or our platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Ticket</CardTitle>
            <CardDescription>
              Fill out the form below to report your issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Issue Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking Issue</SelectItem>
                      <SelectItem value="payment">Payment Problem</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="technical">Technical Problem</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please provide detailed information about your issue"
                    required
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingId">Booking Reference (if applicable)</Label>
                  <Input
                    id="bookingId"
                    name="bookingId"
                    value={formData.bookingId}
                    onChange={handleChange}
                    placeholder="Enter your booking ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Before submitting</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    <li>Please provide as much detail as possible</li>
                    <li>Include any relevant booking information</li>
                    <li>Attach screenshots if applicable</li>
                    <li>We&apos;ll respond within 24 hours</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Need immediate assistance? Contact us directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-xs text-muted-foreground">Available 24/7</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@drushlodge.com</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
              </div>

              <Separator />

              {/* <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available 9 AM - 5 PM EST</p>
                  <Button variant="link" className="p-0 h-auto">
                    Start Chat
                  </Button>
                </div>
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
              <CardDescription>
                Quick solutions to frequent problems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Booking Modifications</h4>
                <p className="text-sm text-muted-foreground">
                  Need to change your booking dates? Visit the booking details page and click &quot;Modify Booking&quot;.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Payment Issues</h4>
                <p className="text-sm text-muted-foreground">
                  Having trouble with payment? Check your payment method and ensure sufficient funds.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Account Access</h4>
                <p className="text-sm text-muted-foreground">
                  Can&apos;t log in? Use the &quot;Forgot Password&quot; option or contact support for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 