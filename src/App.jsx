import { BrowserRouter,Route, Routes } from "react-router-dom";
import TestLevel from "./TestLevel/TestLevel";
import SecondLevel from './SecondLevel/SecondLevel'
import ThirdLevel from "./ThirdLevel/ThirdLevel";
import Main from './MainPage/Main'
import styles from "./App.module.css"
import './i18n/i18n'


function App() {
  return (
    <div className={styles.App}>
      <BrowserRouter>
      
      <Routes>
        <Route path='/' element={<Main/>}/>
        
        <Route path='/level1' element={<TestLevel />}/>
        <Route path='/level2' element={<SecondLevel />}/>
        <Route path='/level3' element={<ThirdLevel/>}/>
      </Routes>
      </BrowserRouter>
      {/* <TestLevel /> */}
      {/* <SecondLevel /> */}
      {/* <ThirdLevel/> */}
      
    </div>
  );
}

export default App;
