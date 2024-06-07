import { BrowserRouter, Link, Route, Routes } from "react-router-dom"
import FaceDetection from "./pages/faceDetection"
import FaceMesh from "./pages/faceMesh"
import ML5FaceAPIRemote from "./pages/ml5-faceapi/remote.jsx"
import ML5FaceAPILocal from "./pages/ml5-faceapi/local.jsx"
import FaceLandMarker from "./pages/faceLandMarker"

function App() {
    return (
        <BrowserRouter>
            <Link to="/"> FaceDetection </Link>
            &emsp;
            <Link to="/faceMesh"> FaceMesh </Link>
            &emsp;
            <Link to="/faceLandMarker"> FaceLandMarker </Link>
            &emsp;
            <Link to="/ml5-faceapi-remote"> ML5FaceAPI-remote </Link>
            <Link to="/ml5-faceapi-local"> ML5FaceAPI-local </Link>
            <Routes>
                <Route path="/" element={<FaceDetection />} />
                <Route path="/faceMesh" element={<FaceMesh />} />
                <Route path="/faceLandMarker" element={<FaceLandMarker />} />
                <Route path="/ml5-faceapi-remote" element={<ML5FaceAPIRemote />} />
                <Route path="/ml5-faceapi-local" element={<ML5FaceAPILocal />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
