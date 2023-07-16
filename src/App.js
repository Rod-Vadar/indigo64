import { Container } from "react-bootstrap";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CleanImageSequence from "./components/CleanImageSequence";
import Donate from "./components/Donate";
import Features from "./components/Features";
import Tutorial from "./components/Tutorial";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <main className="py-3">
          <Container>
            <Routes>
              <Route path="/" element={<CleanImageSequence />} />
              <Route path="donate" element={<Donate />} />
              <Route path="features" element={<Features />} />
              <Route path="tutorial" element={<Tutorial />} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
