import React from 'react';
import { Menu, ActionIcon, Group, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/store';
import { setLang } from '@/store/slices/locale/localeSlice';

const languages = [
  { label: 'English', value: 'en', flag: '🇺🇸' },
  { label: 'Türkçe', value: 'tr', flag: '🇹🇷' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = useAppSelector((state) => state.locale.currentLang);

  const handleLanguageChange = (lang: string) => {
    dispatch(setLang(lang));
    i18n.changeLanguage(lang);
  };

  const currentLanguage = languages.find((l) => l.value === currentLang) || languages[0];

  return (
    <Menu shadow="md" width={150} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
      <Menu.Target>
        <ActionIcon variant="light" size="lg" radius="md" color="blue">
          <Text size="lg">{currentLanguage.flag}</Text>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Select Language</Menu.Label>
        {languages.map((lang) => (
          <Menu.Item
            key={lang.value}
            leftSection={<Text size="sm">{lang.flag}</Text>}
            onClick={() => handleLanguageChange(lang.value)}
            style={{
              backgroundColor: currentLang === lang.value ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
            }}
          >
            <Text size="sm" fw={currentLang === lang.value ? 600 : 400}>
              {lang.label}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageSwitcher;
