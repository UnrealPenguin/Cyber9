import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from "styled-components";
import GlobalStyles from './components/styles/GlobalStyles';
import theme from './components/styles/Theme.style';

import Error from './components/Error';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {

  return (
    <ThemeProvider theme = {theme}>
      <>
      <GlobalStyles />
      <Router>
        <Error />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Collection" element={ <Collection />} />
          <Route path="*" />
        </Routes>
        <Footer />
      </Router>
      </>
    </ThemeProvider>
  );
}

export default App;
