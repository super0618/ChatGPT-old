import { IconExternalLink } from '@tabler/icons-react';
import { useContext } from 'react';

import { useTranslation } from 'next-i18next';

import { OpenAIModel } from '@/types/openai';

import HomeContext from '@/pages/api/home/home.context';

export const LangSelect = () => {
  const { t } = useTranslation('chat');

  const langs = ['ar', 'bn', 'ca', 'de', 'en', 'es', 'fi', 'fr', 'he', 'id', 'it', 'ja', 'ko', 'pl', 'pt', 'ro', 'ru', 'si', 'sv', 'te', 'tr', 'vi', 'zh'];

  const {
    state: { selectedConversation, models, defaultLang },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectedConversation &&
      handleUpdateConversation(selectedConversation, {
        key: 'lang',
        value: e.target.value,
      });
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        Language
      </label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          value={selectedConversation?.lang || defaultLang}
          onChange={handleChange}
        >
          {langs.map((lang) => (
            <option
              key={lang}
              value={lang}
              className="dark:bg-[#343541] dark:text-white"
            >
              {lang}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
