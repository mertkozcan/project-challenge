import { Button, Popover, Text } from "@mantine/core";
import { useState } from "react";
import PopOverTargetContent from "@/components/UserPopOver/PopOverTargetContent";
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store';
import useAuth from '@/utils/hooks/useAuth';

export default function UserPopOver() {
  const [displayPopOver, setDisplayPopOver] = useState<boolean>(false);
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const { signOut } = useAuth();

  return (
    <div>
      <Popover
        width={200}
        position="right"
        opened={displayPopOver}
        onChange={setDisplayPopOver}
        offset={{ mainAxis: 13, crossAxis: 0 }}
      >
        <Popover.Target>
          <div onClick={() => setDisplayPopOver((prevState) => !prevState)} style={{ cursor: 'pointer' }}>
            <PopOverTargetContent />
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <Link to={`/profile/${userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Button variant="subtle" fullWidth mb="xs">
              My Profile
            </Button>
          </Link>
          <Button variant="subtle" color="red" fullWidth onClick={signOut}>
            Sign Out
          </Button>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}
