import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export interface UserState {
  username?: string
  email?: string
  role?: string
  avatar_url?: string
  userId?: string
  level?: number
  total_xp?: number
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
      state.userId = action.payload?.userId
      state.level = action.payload?.level
      state.total_xp = action.payload?.total_xp
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
