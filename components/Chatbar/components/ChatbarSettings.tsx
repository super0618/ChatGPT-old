import { IconBrightness, IconFileExport, IconLanguage, IconLanguageOff, IconSettings } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { useEffect} from 'react';

import { useTranslation } from 'next-i18next';
import HomeContext from '@/pages/api/home/home.context';

import { SettingDialog } from '@/components/Settings/SettingDialog';
import { GPTSettingDialog } from '@/components/Settings/GPTSettingDialog';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';
import { debug } from 'console';
import { useRouter } from 'next/router';
import { Conversation } from '@/types/chat';
import { Head, Html, Main, NextScript } from 'next/document';

export const ChatbarSettings = () => {
  const Router = useRouter();
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const [isGPTSettingDialogOpen, setIsGPTSettingDialog] = useState<boolean>(false);
  const [LightMode, setIsLightMode] = useState<boolean>(false);
  const [Language, setIsLanguage] = useState<boolean>(false);

  const {
    state: {
      apiKey,
      lightMode,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
      selectedConversation,
      prompts,
    },
    dispatch: homeDispatch,
    handleUpdateConversation,
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleApiKeyChange,
  } = useContext(ChatbarContext);

  const handleLightMode = () => {
    homeDispatch({field: 'lightMode', value: LightMode === true ? 'dark':'light'});
    setIsLightMode(!LightMode);
  };

  const handleLanguage = () => {
    console.log(selectedConversation?.lang);
    if(selectedConversation?.lang && selectedConversation?.lang != 'he') {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'ltl');
      Router.push('/', Router.asPath, { locale: selectedConversation.lang })
    } else {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
      Router.push('/', Router.asPath, { locale: 'he' })
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      <SidebarButton
        text={t('LightMode')}
        icon={<IconBrightness size={18} />}
        onClick={() => handleLightMode()}
      />
      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsGPTSettingDialog(true)}
      />
      {!serverSideApiKeyIsSet ? (
        <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
      ) : null}

      {!serverSidePluginKeysSet ? <PluginKeys /> : null}
      <GPTSettingDialog
        open={isGPTSettingDialogOpen}
        onClose={() => {
          setIsGPTSettingDialog(false);
          handleLanguage()
        }}
        conversation={selectedConversation as Conversation}
        prompts={prompts}
        onChangePrompt={(prompt) =>
          handleUpdateConversation(selectedConversation as Conversation, {
            key: 'prompt',
            value: prompt,
          })}
      />
    </div>
  );
};
