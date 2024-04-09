import { FC, useContext, useState, useEffect, useReducer, useRef } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { getSettings, saveSettings } from '@/utils/app/settings';

import { Conversation } from '@/types/chat';
import { Prompt } from '@/types/prompt';

import { Settings } from '@/types/settings';
import Spinner from '../Spinner';
import { ModelSelect } from '../Chat/ModelSelect';
import { LangSelect } from '../Chat/LangSelect';
import { SystemPrompt } from '../Chat/SystemPrompt';
import { TemperatureSlider } from '../Chat/Temperature';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  conversation: Conversation;
  prompts: Prompt[];
  open: boolean;
  onClose: () => void;
  onChangePrompt: (prompt: string) => void;
}
export const GPTSettingDialog: FC<Props> = ({ open, onClose }) => {
  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      loading,
      prompts,
      temperature,
    },
    handleUpdateConversation,
  } = useContext(HomeContext);
  
    const { t } = useTranslation('settings');
  const settings: Settings = getSettings();
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const [l_temperature, setTemperature] = useState<number>(selectedConversation?.temperature as number);
  
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  // Render nothing if the dialog is not open.
  if (!open) {
    return <></>;
  }

  // Render the dialog.
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[700px] transform overflow-y-auto rounded border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[800px] sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="mx-auto flex flex-col space-y-5 px-3 pt-5 sm:max-w-[600px]">
              <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                {models.length === 0 ? (
                  <div>
                    <Spinner size="16px" className="mx-auto" />
                  </div>
                ) : (
                  t('ChatGPT Setting')
                )}
              </div>

              {models.length > 0 && (
                <div className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                <ModelSelect />

                <SystemPrompt
                  conversation={selectedConversation as Conversation}
                  prompts={prompts}
                  onChangePrompt={(prompt) =>
                    handleUpdateConversation(selectedConversation as Conversation, {
                      key: 'prompt',
                      value: prompt,
                    })
                  }
                />

                <TemperatureSlider
                  label={t('Temperature')}
                  init_temperature={selectedConversation?.temperature as number}
                  onChangeTemperature={(temperature) => {
                    setTemperature(temperature);
                  }
                  }
    />
                </div>
              )}
              
              <LangSelect />

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  className="w-40 px-4 py-2 mt-6 border rounded shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                  onClick={() => {
                    handleUpdateConversation(selectedConversation as Conversation, {
                      key: 'temperature',
                      value: l_temperature,
                    })
                    onClose();
                  }}
                >
                  {t('Confirm')}
                </button>
                <button
                  type="button"
                  className="w-40 px-4 py-2 mt-6 border rounded shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
                  onClick={() => {
                    onClose();
                  }}
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
            </div>
            </div>
        </div>
      </div>
  );
};
