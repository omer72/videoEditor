import VideoEditor from './components/VideoEditor'
import "./App.css";
import VideoProvider from './context/VideoContext';
function App() {

  return (
    <VideoProvider>
     <VideoEditor/>
    </VideoProvider>
  )
}

export default App
