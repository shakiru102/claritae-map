import { configureStore } from '@reduxjs/toolkit'
import devices from './reducers/devices'
import positions from './reducers/positions'
// ...

export const store = configureStore({
  reducer: {
     devices,
     positions
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch