import axios from "axios"
import { useEffect, useState } from "react"
import { Provider } from "react-redux"
import Map from "./components/map/Map"
import Resources from "./components/Resources/Resources"
import { store } from "./store"

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  const initiatSession = async () => {
   await axios.post('http://localhost:8082/api/session?email=sshekoni.int@claritae.com&&password=changemenow', null, {
    headers: {
      "Content-Type": " application/x-www-form-urlencoded; charset=UTF-8"
    },
    withCredentials: true
   }).then((res) => {
    console.log(res.data);
    setIsLoggedIn(true)
   })
     
   }
   useEffect(() => {
   initiatSession()
   },[])
  
  return (
    <Provider store={store}>
      <div className="App">
    { isLoggedIn && 
      <Resources>
        <Map />
      </Resources>
      }
    </div>
    </Provider>
  )
}




export default App
