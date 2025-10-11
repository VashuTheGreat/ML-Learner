import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Navigation from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";
import Index from "./pages/Index";
import Problems from "./pages/Problems";
import Dashboard from "./pages/Dashboard";
import Playground from "./pages/Playground";
import Interview from "./pages/Interview";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Solve from "./pages/Solve"
import Notes from "./pages/Notes"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import React, { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [token, setToken] = useState(false);

  if(token){
    sessionStorage.setItem("token", JSON.stringify(token));
  }

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(JSON.parse(storedToken));
    }
  }, []);

  return (
    <>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background">
            <Navigation token={token} />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/problems" element={<Problems />} />
                <Route
                  path="/dashboard"
                  element={token ? <Dashboard /> : <Login setToken={setToken} />}
                />
                <Route path="/playground" element={<Playground />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                                <Route path="/notes" element={<Notes />} />

                                <Route path="/solve" element={<Solve />} />

                <Route path="/solve" element={<Solve />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login setToken={setToken} />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </>
);    
}
export default App;