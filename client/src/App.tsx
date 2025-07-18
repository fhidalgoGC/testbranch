import { Switch, Route } from "wouter";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { store } from "./app/store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import "./common/utils/i18n";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Buyers from "@/pages/Buyers";
import CreateBuyer from "@/pages/CreateBuyer";
import Sellers from "@/pages/Sellers";
import PurchaseContracts from "@/pages/PurchaseContracts";
import SaleContracts from "@/pages/SaleContracts";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/home" component={Home} />
      <Route path="/buyers" component={Buyers} />
      <Route path="/buyers/create" component={CreateBuyer} />
      <Route path="/sellers" component={Sellers} />
      <Route path="/purchase-contracts" component={PurchaseContracts} />
      <Route path="/sale-contracts" component={SaleContracts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Set document language based on detected language
    const savedLanguage = localStorage.getItem('language') || 'es';
    document.documentElement.lang = savedLanguage;
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
