import axios from "axios"
import { FC, ReactNode, useEffect } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../../store"
import { setDevice } from "../../store/reducers/devices"

interface Props {
    children: ReactNode
}



const Resources: FC<Props> = ({ children }) => {

    const dispatch = useDispatch()
    const { devices } = useSelector((state: RootState) => state.devices)


    const getDevices = async () => {
        try {
            // const response = await axios.get('https://tg.claritae.net/api/session?token=CVUQweN7kYQbx7LrsMGPwvqKLV4CYoW6')
            const res = await axios.get('http://localhost:8082/api/devices', { withCredentials: true })
            dispatch(setDevice(res.data))
        } catch (error: any) {
            return 
        }
    }

    useEffect(() => {
       getDevices()
    },[])

  return (
    <>
    { devices ? children :  null }
    </>
  )
}

export default Resources