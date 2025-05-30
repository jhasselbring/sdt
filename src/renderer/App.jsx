import Layout from './components/Layout.jsx';
import './App.css';
import { useAppContext } from './context/AppContext.jsx';

function App() {
  const { state } = useAppContext();
  return (
    <Layout layoutConfig={{ components: state.componentSections }} />
  );
}

export default App;
