import React, { useEffect, useState } from 'react';
import Views from '@/components/Layout/Views';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import navigationConfig from '@/configs/navigation.config';
import { LinksGroup } from '@/components/Layout/LinksGroup';
import classes from '@/components/Layout/LayoutTypes/SimpleSideBar.module.css';
import { Group, AppShell, Burger, ScrollArea, Box, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SimpleSideBarBottomContent from '@/components/Layout/LayoutTypes/SimpleSideBarBottomContent';
import { useTranslation } from 'react-i18next';
import AuthorityCheck from '@/route/AuthorityCheck';
import { useAppSelector } from '@/store';
import NotificationDropdown from '@/components/Notifications/NotificationDropdown';
import useAuth from '@/utils/hooks/useAuth';
import { IconLogin, IconSun, IconMoon } from '@tabler/icons-react';
import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import UserLevelDisplay from '@/components/User/UserLevelDisplay';

function SideBarContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState('');
  const { t } = useTranslation();
  const userAuthority = useAppSelector((state) => state.auth.user.role);

  useEffect(() => {
    const currentPath = location.pathname.split('/')[1];
    setActive(currentPath);
  }, [location.pathname]);

  const links = navigationConfig.map((item) => {
    if (item.subMenu && item.subMenu.length > 0) {
      const subLinks = item.subMenu.map((i) => ({ label: i.title, link: i.path }));
      return <LinksGroup key={item.key} icon={item.icon} label={item.title} links={subLinks} />;
    }
    return (
      <AuthorityCheck key={item.key} userAuthority={userAuthority || ''} authority={item.authority}>
        <Link
          className={classes.link}
          data-active={item.path.split('/')[1] === active ? 'true' : undefined}
          to={item.path}
          onClick={(e) => {
            e.preventDefault();
            setActive(item.path.split('/')[1]);
            navigate(item.path);
          }}
        >
          <item.icon className={classes.linkIcon} stroke={1.5} />
          <span>{item.translateKey ? t(item.translateKey) : item.title}</span>
        </Link>
      </AuthorityCheck>
    );
  });

  return <>{links}</>;
}

export default function SimpleSideBar() {
  const [opened, { toggle }] = useDisclosure();
  const { authenticated } = useAuth();
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });
  const user = useAppSelector((state) => state.auth.userInfo);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <img 
              className={classes.logo} 
              alt="Mantine Logo" 
              src="/logo/logo-light-full.svg" 
              style={{ height: 30, width: 'auto' }}
            />
          </Group>
          <Group>
            <ActionIcon
              onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
              variant="default"
              size="lg"
              radius="md"
              aria-label="Toggle color scheme"
              mr="xs"
            >
              {computedColorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>

            {authenticated ? (
              <Group gap="xs">
                 {user && (
                    <UserLevelDisplay 
                      level={user.level || 1} 
                      totalXp={user.total_xp || 0} 
                      size="sm"
                      showProgress={false}
                    />
                  )}
                <NotificationDropdown />
              </Group>
            ) : (
              <Group gap="xs">
                <Button variant="default" size="xs" onClick={() => navigate('/sign-in')}>Sign In</Button>
                <Button size="xs" onClick={() => navigate('/sign-up')}>Sign Up</Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <SideBarContent />
        </AppShell.Section>
        <AppShell.Section>
          {authenticated ? (
            <SimpleSideBarBottomContent />
          ) : (
            <div className={classes.link} onClick={() => navigate('/sign-in')} style={{ cursor: 'pointer' }}>
              <IconLogin className={classes.linkIcon} stroke={1.5} />
              <span>Sign In</span>
            </div>
          )}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Views />
      </AppShell.Main>
    </AppShell>
  );
}
