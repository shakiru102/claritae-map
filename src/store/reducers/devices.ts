import { createSlice } from "@reduxjs/toolkit";

interface initialStateProps {
    devices: any;
    selectedDevice: object;
}
const initialState: initialStateProps = {
    devices: [],
    selectedDevice: {}
}

const devices = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        setDevice: (state: initialStateProps, actions) => {
            state.devices = actions.payload
        },
        updateDevice: (state: initialStateProps, actions) => {
            const deviceIndex = () => state.devices.findIndex((item: any) => item.id === actions.payload.devices[0].deviceId)
            state.devices[deviceIndex()] =  actions.payload.devices[0]
        },
        setSelectedDevice: (state: initialStateProps, actions) => {
            const device = () => state.devices.find((item: any) => item.id === actions.payload)
            state.selectedDevice = device
        }
    } 
})

export const { setDevice, updateDevice, setSelectedDevice } = devices.actions

export default devices.reducer