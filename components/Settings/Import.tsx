import { IconFileImport } from '@tabler/icons-react';
import { FC } from 'react';

import { useTranslation } from 'next-i18next';

import { SupportedExportFormats } from '@/types/export';

// import { SidebarButton } from '../Sidebar/SidebarButton';

interface Props {
  onImport: (data: SupportedExportFormats) => void;
}

export const Import: FC<Props> = ({ onImport }) => {
  // const { t } = useTranslation('sidebar');
  // const { Configuration, OpenAIApi } = require("openai");
  // const fs = require('fs');
  // const configuration = new Configuration({
  //   apiKey: process.env.OPENAI_API_KEY,
  // });
  // const openai = new OpenAIApi(configuration);

  return (
    <>
      <input
        id="import-file"
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept="video/*"
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          //   const resp = await openai.createTranscription(
          //     fs.createReadStream(e.target.files[0].toString), // audio input file
          //     "whisper-1", // Whisper model name. 
          //     undefined, // Prompt
          //     'text', // Output format. Options are: json, text, srt, verbose_json, or vtt.
          //     1, // Temperature.
          //     'he' // ISO language code. Eg, for english `en`
          //   );
          // console.log(resp.data);
        }}
      />

    </>
  );
};
