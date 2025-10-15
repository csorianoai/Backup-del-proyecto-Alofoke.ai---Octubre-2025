import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Article from "./pages/Article";
import Search from "./pages/Search";
import CasosUso from "./pages/CasosUso";
import Noticias from "./pages/Noticias";
import NotFound from "./pages/NotFound";
import LatamFeed from "./pages/LatamFeed";
import CountryFeed from "./pages/CountryFeed";
import CuratedArticle from "./pages/CuratedArticle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* Legacy article routes */}
          <Route path="/articulo/:slug" element={<Article />} />
          <Route path="/articulo/*" element={<Article />} />
          
          {/* Curated content routes */}
          <Route path="/latam" element={<LatamFeed />} />
          <Route path="/pais/:country" element={<CountryFeed />} />
          <Route path="/:country/:year/:month/:day/:slug" element={<CuratedArticle />} />
          
          {/* Other routes */}
          <Route path="/buscar" element={<Search />} />
          <Route path="/casos-uso" element={<CasosUso />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/google2fcca3e3f5be6d9d.html" element={<div>google-site-verification: google2fcca3e3f5be6d9d.html</div>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
