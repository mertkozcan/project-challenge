import {Avatar, Text} from "@mantine/core";
import classes from './CollapsedUserPopOverContent.module.css'
import {useAppSelector} from "@/store";

export default function CollapsedUserPopOverContent(){
  const {username,email,avatar_url} = useAppSelector((state) => state.auth.user);
  const userNameInitial = username!.split(' ')[0][0]

  return(
    <>
      <div className={classes.contentWrapper}>
        <Avatar src={avatar_url} radius={'lg'} size={100}></Avatar>
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
