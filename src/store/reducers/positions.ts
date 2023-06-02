import { createSlice } from "@reduxjs/toolkit";

interface initialStateProps {
    positions: any;
    selectedPosition: object;
}
const initialState: initialStateProps = {
    positions: null,
    selectedPosition: {}
}

const position = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        setPositions: (state: initialStateProps, actions) => {
            // console.log("got: ", actions.payload);
            if(actions.payload.positions.length > 1) state.positions = actions.payload
            else {
              const newData = () => state.positions.positions.findIndex((item: any) => item.deviceId === actions.payload.positions[0].deviceId)
              state.positions.positions[newData()] = actions.payload.positions[0]
            }
        },
        setSinglePosition: (state: initialStateProps, actions) => {
            state.selectedPosition = actions.payload
        }
    }
})
export const { setPositions } = position.actions

export default position.reducer