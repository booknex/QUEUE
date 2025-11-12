import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerForm);
      toast({
        title: "Registration successful",
        description: "Welcome! Your account has been created.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Client Queue Manager</CardTitle>
          <CardDescription>Sign in to manage your client queue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    data-testid="input-login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="input-login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-login"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    data-testid="input-register-username"
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    data-testid="input-register-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-firstname">First Name</Label>
                  <Input
                    id="register-firstname"
                    data-testid="input-register-firstname"
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastname">Last Name</Label>
                  <Input
                    id="register-lastname"
                    data-testid="input-register-lastname"
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-register"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
