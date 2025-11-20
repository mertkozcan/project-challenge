import {Avatar, Text} from "@mantine/core";
import classes from './PopOverTargetContent.module.css'
import {useAppSelector} from "@/store";

export default function PopOverTargetContent(){
  const {username,email} = useAppSelector((state) => state.auth.user);
  const firstNameInitial = username ? username.slice(0, 1).toUpperCase() : '';

  return(
    <>
      <div className={classes.contentWrapper}>
        <Avatar color={'blue'} radius={'lg'}>{firstNameInitial}</Avatar>
        <div>
          <Text style={{fontWeight:'bold'}} size="md">
            {username}
          </Text>
          {/* <Text size="xs">
            {email}
          </Text> */}
        </div>
      </div>
    </>
  )
}
