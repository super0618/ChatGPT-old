import { OPENAI_API_TYPE } from '../utils/app/const';

export interface OpenAIModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
}

// GPT_3_5_TURBO_INSTRUCT_0914 = 'gpt-3.5-turbo-instruct-0914',
// GPT_3_5_TURBO_INSTRUCT = 'gpt-3.5-turbo-instruct',
// GPT_3_5_TURBO_0613 = 'gpt-3.5-turbo-0613',
// GPT_3_5_TURBO_16K_0613 = 'gpt-3.5-turbo-16k-0613',
// GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',
// GPT_3_5_TURBO_0125 = 'gpt-3.5-turbo-0125',
// GPT_3_5_TURBO_0301 = 'gpt-3.5-turbo-0301',
// GPT_4_1106_PREVIEW = 'gpt-4-1106-preview',
// GPT_4_0613 = 'gpt-4-0613',
// GPT_4_VISION_PREVIEW = 'gpt-4-vision-preview',
// GPT_4_0314 = 'gpt-4-0314',
// GPT_4_0125_PREVIEW = 'gpt-4-0125-preview',
// GPT_4_TURBO_PREVIEW = 'gpt-4-turbo-preview'

export enum OpenAIModelID {
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_3_5_16K = 'gpt-3.5-turbo-16k',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k-0314',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.GPT_3_5;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: 'GPT-3.5',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_3_5_16K]: {
    id: OpenAIModelID.GPT_3_5_16K,
    name: 'GPT-3.5-16K',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: 'GPT-4',
    maxLength: 24000,
    tokenLimit: 8000,
  },
  [OpenAIModelID.GPT_4_32K]: {
    id: OpenAIModelID.GPT_4_32K,
    name: 'GPT-4-32K',
    maxLength: 96000,
    tokenLimit: 32000,
  },
};
