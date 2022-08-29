import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OtherPage from './OtherPage';
import Fib from './Fib';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h2>Fibonacci calculator</h2>

          <Link to="/">Home</Link>
          <Link to="/otherpage">Other page</Link>
        </header>
        <main>
          <Routes>
            <Route exact path="/" element={<Fib />} />
            <Route exact path="/otherpage" element={<OtherPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
