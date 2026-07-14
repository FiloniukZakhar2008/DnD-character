import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import CharacterCreate from '@/pages/CharacterCreate';
import CharacterDetail from '@/pages/CharacterDetail';
import LevelUp from '@/pages/LevelUp';
import Reference from '@/pages/Reference';
// Add page imports here

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CharacterCreate />} />
            <Route path="/character/:id" element={<CharacterDetail />} />
            <Route path="/character/:id/level-up" element={<LevelUp />} />
            <Route path="/reference" element={<Reference />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
