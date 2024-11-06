import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { UserProvider } from "./context/UserContext";
import { InterviewProvider } from "./context/InterviewContext";

function App() {
  return (
    <>
      <UserProvider>
        <InterviewProvider>
            <Navbar />
            <Home />
        </InterviewProvider>
      </UserProvider>
    </>
  );
}

export default App;
