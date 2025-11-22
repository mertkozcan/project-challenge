import { useAppSelector } from '@/store';

export default function DebugAuth() {
  const authState = useAppSelector((state) => state.auth);
  
  console.log('=== DEBUG AUTH STATE ===');
  console.log('User:', authState.user);
  console.log('UserInfo:', authState.userInfo);
  console.log('Session:', authState.session);
  console.log('User Role:', authState.user.role);
  console.log('UserInfo Role:', authState.userInfo.role);
  console.log('========================');
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div><strong>Debug Auth State:</strong></div>
      <div>User Role: {authState.user.role || 'undefined'}</div>
      <div>UserInfo Role: {authState.userInfo.role || 'undefined'}</div>
      <div>Username: {authState.user.username || 'undefined'}</div>
      <div>Signed In: {authState.session.signedIn ? 'Yes' : 'No'}</div>
    </div>
  );
}
