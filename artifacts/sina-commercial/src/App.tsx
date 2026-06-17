import { Switch, Route, Router as WouterRouter } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageWrapper } from "./components/layout/PageWrapper";
import NotFound from "@/pages/not-found";

// Pages
import Home from "./pages/Home";
import Opportunities from "./pages/Opportunities";
import SearchProperties from "./pages/SearchProperties";
import MarketIntelligence from "./pages/MarketIntelligence";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

function Router() {
  return (
    <PageWrapper>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/opportunities" component={Opportunities} />
        <Route path="/search-properties" component={SearchProperties} />
        <Route path="/market-intelligence" component={MarketIntelligence} />
        <Route path="/services" component={Services} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </PageWrapper>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
