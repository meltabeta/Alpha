import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Playlist from './pages/Playlist'
import Search from './pages/Search'
import FilteredView from './pages/FilteredView'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app">
        <main>
          <Routes>
            {/* Static routes first */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/donghua" element={<FilteredView type="Donghua" />} />
            <Route path="/anime" element={<FilteredView type="Anime" />} />
            <Route path="/ongoing" element={<FilteredView status="Ongoing" />} />
            <Route path="/completed" element={<FilteredView status="Completed" />} />
            
            {/* Dynamic routes with strict patterns */}
            <Route 
              path="/:type(donghua|anime)/:title/episode-:episode/:id" 
              element={<Playlist />} 
            />
            <Route 
              path="/:type(donghua|anime)/:title/:id" 
              element={<Playlist />} 
            />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={
              <div className="error-container">
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for might have been moved or deleted.</p>
                <Link to="/" className="error-home-link">Return to Home</Link>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
