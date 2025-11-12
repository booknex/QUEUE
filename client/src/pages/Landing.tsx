import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Clock, Bell } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Client Queue Manager</h1>
          <Button onClick={handleLogin} data-testid="button-login">
            Log In
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Manage Client Work with Confidence
            </h2>
            <p className="text-xl text-muted-foreground">
              A productivity-focused application designed for professionals who manage daily client interactions across multiple companies.
            </p>
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleLogin} data-testid="button-login-hero">
              Get Started
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Priority Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically prioritize clients based on time since last touch. Never miss a client who needs attention.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Multi-Company Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage isolated data for multiple companies with easy switching between accounts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time multi-user collaboration with instant updates across all connected clients.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Integrated Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built-in Twilio integration for browser-based calling and SMS messaging with clients.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container">
          Client Queue Manager - Streamline your client workflows
        </div>
      </footer>
    </div>
  );
}
