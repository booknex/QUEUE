import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Always call the hook (hook rules)
  useWebSocket();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <Redirect to="/auth" />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
