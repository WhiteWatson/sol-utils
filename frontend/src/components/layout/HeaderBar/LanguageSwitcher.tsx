import React from "react";
import { Button, Dropdown } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.less";

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const languageMenuItems = [
    {
      key: "zh",
      label: "简体中文",
      onClick: () => handleLanguageChange("zh"),
    },
    {
      key: "en",
      label: "English",
      onClick: () => handleLanguageChange("en"),
    },
  ];

  return (
    <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight" arrow>
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className={styles.languageButton}
      >
        {t("language")}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
