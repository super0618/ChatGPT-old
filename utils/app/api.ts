import { Plugin, PluginID } from '@/types/plugin';
// import { useRouter } from 'next/router';

export const getEndpoint = (plugin: Plugin | null) => {
  // const router = useRouter();
  if (!plugin) {
    // return `${router.basePath}/api/chat`;
    return `/api/chat`;
  }

  if (plugin.id === PluginID.GOOGLE_SEARCH) {
    // return `${router.basePath}/api/google`;
    return `/chat/api/google`;
  }

  // return `${router.basePath}/api/chat`;
  return `/api/chat`;
};

export const getAudioTransEndpoint = () => {
  return `/chat/api/audio`;
};
