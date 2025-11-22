import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export interface UserInfoState {
  email: string
  userId: string
  isTwoFaEnabled?: boolean
  username?: string
  language?: string
  role: string,
  googleLogin?: boolean,
  notificationCount?: number
}

const initialState: UserInfoState = {
  email: '',
  userId: '',
  isTwoFaEnabled: false,
  username: '',
  language: '',
  role: '',
  googleLogin: false,
  notificationCount: 0
}

const userInfoSlice = createSlice({
  name: `${SLICE_BASE_NAME}/userInfo`,
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<UserInfoState>) {
      state.userId = action.payload?.userId
      state.email = action.payload?.email
      state.language = action.payload?.language
      state.username = action.payload?.username
      state.role = action.payload?.role

      state.googleLogin = action.payload.googleLogin
      state.notificationCount = action.payload?.notificationCount
      state.isTwoFaEnabled = action.payload?.isTwoFaEnabled
    },
    setLanguage(state, action) {
      state.language = action.payload?.language
    },
    setUserInfoRole(state, action) {
      state.role = action.payload?.role
    },
    setDisplayName(state, action) {
      state.username = action.payload
    },
    setUserId(state, action) {
      state.userId = action.payload
    },
    setNotificationCount(state, action) {
      state.notificationCount = action.payload
    },
    setTwoFactorAuth(state, action) {
      state.isTwoFaEnabled = action.payload
    },
  }
})

export const {
  setUserInfo,
  setUserId,
  setLanguage,
  setDisplayName,
  setTwoFactorAuth,
  setUserInfoRole,
  setNotificationCount
} = userInfoSlice.actions
export default userInfoSlice.reducer
