import classes from "@/components/Layout/LayoutTypes/SimpleSideBar.module.css";
import useAuth from "@/utils/hooks/useAuth";
import PopOverTargetContent from "@/components/UserPopOver/PopOverTargetContent";
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store';
import {
  IconLogout,
} from '@tabler/icons-react';

export default function SimpleSideBarBottomContent(){
  const {signOut} = useAuth()
  const username = useAppSelector((state) => state.auth.user.username);

  return(
    <>
      <Link to={`/profile/${username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
             <PopOverTargetContent/>
        </div>
      </Link>
      
      <div className={classes.link} onClick={(event) => {
        signOut()
      }}>
        <IconLogout className={classes.icon}/>
        <span>Exit</span>
      </div>
    </>
  )
}
