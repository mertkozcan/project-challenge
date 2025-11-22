import {
  setUser,
  signInSuccess,
  signOutSuccess,
  useAppSelector,
  useAppDispatch, setUserInfo, setUserId
} from '@/store'
import appConfig from '@/configs/app.config'
import {REDIRECT_URL_KEY} from '@/constants/app.constant'
import {useNavigate} from 'react-router-dom'
import {SignInCredential, SignUpCredential} from '@/@types/auth'
import {AuthService} from "@/services/auth/auth.service";
import useQuery from './useQuery'

type Status = 'success' | 'failed'

function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const {
    token,
    signedIn
  } = useAppSelector((state) => state.auth.session)
  const userId = useAppSelector(state => state.auth.userInfo.userId)
  const query = useQuery()

  const signIn = async (
    values: SignInCredential
  ): Promise<
    | {
    status: Status
    message: string
  }
    | undefined
  > => {
    try {
      const resp = await AuthService.signIn(values.username, values.password)
      const user=resp.profile;
      dispatch(setUserId(user.id))
      const {
        avatar_url,
        role,
        email,
        username
      } = user
      dispatch(signInSuccess({
        token: '',
        refreshToken: '',
        expireTime: 0,
        signedIn: true,
      }))
      dispatch(
        setUser(
          {
            username: username,
            email: email,
            role: role,
            avatar_url: avatar_url,
          }
        )
      )
      const redirectUrl = query.get(REDIRECT_URL_KEY)
      navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath)
      return {
        status: 'success',
        message: ''
      }
    } catch (errors: any) {
      return {
        status: 'failed',
        message: errors?.response?.data?.description || errors.toString()
      }
    }
  }

  const signUp = async (values: SignUpCredential) => {
    try {
      await AuthService.signUp(values.email, values.password, values.username)
      return {
        status: 'success',
        message: ''
      }
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (errors: any) {
      return {
        status: 'failed',
        message: errors?.response?.data?.description || errors.toString()
      }
    }
  }

  const handleSignOut = () => {
    dispatch(signOutSuccess())
    dispatch(setUserInfo({
      googleLogin: false,
      username: '',
      role: '',
      email: '',
      userId: '' // Clear userId on sign out
    }))
    dispatch(
      setUser({
        username: '',
        role: '',
        email: '',
        avatar_url: '',
      })
    )
    navigate(appConfig.unAuthenticatedEntryPath)
  }

  const signOut = async () => {
    await AuthService.signOut() // Call Supabase signOut
    handleSignOut()
  }

  return {
    authenticated:signedIn, //&& token ,
    signIn,
    signUp,
    signOut,
  }
}

export default useAuth
