import Layout from './components/Layout2.jsx';
import './App.css';
import { useAppContext } from './context/AppContext.jsx';

function App() {
  const { state } = useAppContext();

  return (
    <Layout
      layoutConfig={{ components: state.componentSections }}
      drawerState={state.componentSections.state}
    />
  );
}

export default App;
