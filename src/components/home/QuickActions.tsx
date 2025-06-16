// components/QuickActions.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Hotel, Settings, HelpCircle } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
            <Link href="/book">
              <Hotel className="h-6 w-6" />
              <span>Book a Room</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
            <Link href="/my-bookings">
              <Calendar className="h-6 w-6" />
              <span>My Bookings</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
            <Link href="/settings/profile">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
            <Link href="/report-problem">
              <HelpCircle className="h-6 w-6" />
              <span>Get Help</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}