import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export interface UserState {
  username?: string
  email?: string
  role?: string
  avatar_url?: string
}

const initialState: UserState = {
  username: '',
  email: '',
  role: '',
  avatar_url: '',
}

const userSlice = createSlice({
  name: `${SLICE_BASE_NAME}/user`,
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.email = action.payload?.email
      state.username = action.payload?.username
      state.role = action.payload?.role
      state.avatar_url = action.payload?.avatar_url
    },
    setUserRole(state,action){
      state.role = action.payload.role
    },
    setUserName(state,action) {
      state.username = action.payload
    },
    setUserAvatar(state, action) {
      state.avatar_url = action.payload
    },
  },
})

export const { setUser,setUserRole,setUserName } = userSlice.actions
export default userSlice.reducer
