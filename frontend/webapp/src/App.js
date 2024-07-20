import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Form,
} from 'react-router-dom';

// import Blog from './BlogPage/BlogPage';
import Park from './ParkPage/ParkPage.js';
import QrPage from './QRpage/QrPage.js';
import FindSpot from './FindSpot/FindSpot.js';
import FloorMenu from './FloorMenu/FloorMenu.js';
import MainComponent from './FloorSpecific/MainComponent.js';
import Main from './MainMenu/Main.js';
import BlogPage from './BlogPage/Blog';
import StoreList from './StoreList/StoreList.js';
import EnterArcade from './EnterArcade/EnterArcade.js';
import FindAD from './Fix/FindAD.js';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/qr/:id" element={<QrPage />} />
          <Route path="/storeinfo/:name" element={<BlogPage />} />
          <Route path="/storelist" element={<StoreList />} />
          <Route path="/parkinfo" element={<Park />} />
          <Route path="/floorspecific" element={<MainComponent />} />
          <Route path="/findspot/:name" element={<FindSpot />} />
          <Route path="/build" element={<EnterArcade />} />
          <Route path="/floormenu" element={<FloorMenu />} />
          <Route path="/floorspecific/:building/:wing"element={<MainComponent />}/>
          <Route path="/findad" element={<FindAD />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
