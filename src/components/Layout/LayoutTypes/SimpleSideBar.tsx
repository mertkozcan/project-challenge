import React, { useEffect, useState } from 'react';
import Views from '@/components/Layout/Views';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import navigationConfig from '@/configs/navigation.config';
import { LinksGroup } from '@/components/Layout/LinksGroup';
import classes from '@/components/Layout/LayoutTypes/SimpleSideBar.module.css';
import { Group, AppShell, Burger, ScrollArea, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SimpleSideBarBottomContent from '@/components/Layout/LayoutTypes/SimpleSideBarBottomContent';
import { useTranslation } from 'react-i18next';
import AuthorityCheck from '@/route/AuthorityCheck';
import { useAppSelector } from '@/store';
import NotificationBell from '@/components/Notifications/NotificationBell';

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
            <NotificationBell />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <SideBarContent />
        </AppShell.Section>
        <AppShell.Section>
          <SimpleSideBarBottomContent />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Views />
      </AppShell.Main>
    </AppShell>
  );
}
