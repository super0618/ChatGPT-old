import { NEXT_PUBLIC_WORDPRESS_URL } from '@/utils/app/const';
import { useRouter } from 'next/router';

import { IconMicrophone, IconDownload } from '@tabler/icons-react';
import { isIOS, isAndroid, MobileView, isBrowser, browserName, isMobile } from 'react-device-detect';

import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';

import { getEndpoint, getAudioTransEndpoint } from '@/utils/app/api';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/chat';
import { Plugin } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { DownloadChatDialog } from '@/components/Settings/DownloadChatDialog';
import React from 'react';
import axios from "axios";

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

"use strict";
export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t, i18n } = useTranslation('chat');
  const [isDownloadChat_open, setIsDownloadChatDialog_open] = useState<boolean>(false);

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
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [micBtn_caption, setMicBtn_Caption] = useState<string>(t('Start') as string);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [result, setResult] = useState<string>("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // const [chunks, pushChunks] = useState<BlobPart[]>([]);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  let chunks: BlobPart[] | undefined = [];
  const router = useRouter();

  async function transcribeAudio(blobData: Blob) {
    const fetch_url = getAudioTransEndpoint();
    if (blobData.size > 0) {
      const controller = new AbortController();
      var audio_file = new File([blobData], `file${Date.now()}.mp4`);

      let formData = new FormData();
      formData.append("file", audio_file);
      try {
        const resp = await axios.post(fetch_url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        if (resp.data.Status === 'ok')
          return resp.data.Text;
      } catch (err) {
        console.log(err)
        return "error";
      }
    }
  }

  const handleSpeechToText = async (audioBlob: Blob) => {
    const transcript = await transcribeAudio(audioBlob);
    // textareaRef.current?textareaRef.current.textContent = transcript: '';
    setResult(transcript);
  };

  const handleOnDataAvailable = async ({ data }: BlobEvent) => {
    if (data.size > 0) {
      setIsSending(true);
      const tmpChunks = [...(chunks || []), data]
      chunks = tmpChunks;
      let audioBlob = null;
      if(isAndroid || isIOS)
        audioBlob = new Blob(chunks, { type: 'audio/mp4' });
      else
        audioBlob = new Blob(chunks, { type: 'audio/webm' });
  
      chunks = [];
      await handleSpeechToText(audioBlob);
      setIsSending(false);
    }
  };

  const handleOnStop = async () => {
    setIsRecording(false);
    console.log("DEBUG", ((new Error().stack as string).split("at ")[1]).trim());

    // stream.getTracks().forEach(track => track.stop());
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
    }
  }

  function getSupportedMimeTypes(media: string, types: string[], codecs: string[]) {
    const isSupported = MediaRecorder.isTypeSupported;
    const supported : string[] = [];
    types.forEach((type) => {
      const mimeType = `${media}/${type}`;
      codecs.forEach((codec) => [
          `${mimeType};codecs=${codec}`,
          `${mimeType};codecs=${codec.toUpperCase()}`,
          // /!\ false positive /!\
          // `${mimeType};codecs:${codec}`,
          // `${mimeType};codecs:${codec.toUpperCase()}` 
        ].forEach(variation => {
          if(isSupported(variation)) 
              supported.push(variation);
      }));
      if (isSupported(mimeType))
        supported.push(mimeType);
    });
    return supported;
  };

  const startRecording = async () => {
    setIsRecording(true);
    const audioTypes = ["webm", "ogg", "mp3", "x-matroska", "mp4"];
    const codecs = ["should-not-be-supported","vp9", "vp9.0", "vp8", "vp8.0", "avc1", "av1", "h265", "h.265", "h264", "h.264", "opus", "pcm", "aac", "mpeg", "mp4a"];
    const supportedAudios = getSupportedMimeTypes("audio", audioTypes, codecs);
    // alert('-- All supported Audios : ' + supportedAudios);
    setMicBtn_Caption(t('Stop') as string);

    let mimeType = 'audio/webm';
    if(isAndroid || isIOS)
      mimeType = 'audio/mp4';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      alert(mimeType +' mime type is not supported');
      return;
    }
    var options = {
      audioBitsPerSecond: 128000,
      mimeType: mimeType
    }
    let l_mediaStream: MediaStream;
    try {
      l_mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(l_mediaStream);
      let l_recorder: MediaRecorder;
      if (l_mediaStream) {
        l_recorder = new MediaRecorder(l_mediaStream, options);
        l_recorder.ondataavailable = handleOnDataAvailable;
        l_recorder.onstop = handleOnStop;
        l_recorder.start();
        setRecorder(l_recorder);
      }

    } catch (e) {
      console.error('Error getting user media:', e);
    }
  };
  function getCookie(name: string) {
    const matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : '9999999';
  }

  const stopRecording = async () => {
    setIsRecording(false);
    setMicBtn_Caption(t('Start') as string);
    if (!recorder) return;
    recorder.stop();
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        const wordpressUserid = getCookie('wordpress_userid') ;
    
        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: updatedConversation.messages,
          key: apiKey,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
          userid: parseInt(wordpressUserid, 10),
        };
        const endpoint = getEndpoint(plugin);
        let body;
        if (!plugin) {
          body = JSON.stringify(chatBody);
        } else {
          body = JSON.stringify({
            ...chatBody,
            googleAPIKey: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_API_KEY')?.value,
            googleCSEId: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_CSE_ID')?.value,
          });
        }
        const controller = new AbortController();
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });
        console.log(endpoint);
        console.log({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });
        console.log(response);
        if (!response.ok) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          if(response.status == 503) {
            // alert(response.statusText);
            // router.push(NEXT_PUBLIC_WORDPRESS_URL+'/plan');
          }
          if(response.status == 500) {
            toast(response.statusText);
          }
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        }
        if (!plugin) {
          if (updatedConversation.messages.length === 1) {
            const { content } = message;
            const customName =
              content.length > 30 ? content.substring(0, 30) + '...' : content;
            updatedConversation = {
              ...updatedConversation,
              name: customName,
            };
          }
          homeDispatch({ field: 'loading', value: false });
          const reader = data.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let isFirst = true;
          let text = '';
          while (!done) {
            if (stopConversationRef.current === true) {
              controller.abort();
              done = true;
              break;
            }
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            text += chunkValue;
            if (isFirst) {
              isFirst = false;
              const updatedMessages: Message[] = [
                ...updatedConversation.messages,
                { role: 'assistant', content: chunkValue },
              ];
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
            } else {
              const updatedMessages: Message[] =
                updatedConversation.messages.map((message, index) => {
                  if (index === updatedConversation.messages.length - 1) {
                    return {
                      ...message,
                      content: text,
                    };
                  }
                  return message;
                });
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
            }
          }
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'messageIsStreaming', value: false });
        } else {
          const { answer } = await response.json();
          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: 'assistant', content: answer },
          ];
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };
          homeDispatch({
            field: 'selectedConversation',
            value: updateConversation,
          });
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }
      }
    },
    [
      apiKey,
      conversations,
      pluginKeys,
      selectedConversation,
      stopConversationRef,
    ],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  useEffect(() => {
    if (i18n.language === 'en') {
      setMicBtn_Caption('Start');
    } else if (i18n.language === 'he') {
      setMicBtn_Caption('הַתחָלָה');
    }
  }, [i18n.language]); // re-run when language changes  

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      {!(apiKey || serverSideApiKeyIsSet) ? (
        <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-bold text-black dark:text-white">
            Welcome to Chatbot UI
          </div>
          <div className="text-center text-lg text-black dark:text-white">
            <div className="mb-8">{`Chatbot UI is an open source clone of OpenAI's ChatGPT UI.`}</div>
            <div className="mb-2 font-bold">
              Important: Chatbot UI is 100% unaffiliated with OpenAI.
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-2">
              Chatbot UI allows you to plug in your API key to use this UI with
              their API.
            </div>
            <div className="mb-2">
              It is <span className="italic">only</span> used to communicate
              with their API.
            </div>
            <div className="mb-2">
              {t(
                'Please set your OpenAI API key in the bottom left of the sidebar.',
              )}
            </div>
            <div>
              {t("If you don't have an OpenAI API key, you can get one here: ")}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                openai.com
              </a>
            </div>
          </div>
        </div>
      ) : modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div
            id="main_chatbox" className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {selectedConversation?.messages.length === 0 ? (
              <>
                <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                  {models.length > 0 && (
                    <div className="flex h-full flex-col text-neutral-400 space-y-4 rounded-lg border border-neutral-400 p-4 dark:border-neutral-600">
                      {t("Enter your message to start a chat. This could be a question, a statement, or any other text")}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* <div className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                  {t('Model')}: {selectedConversation?.model.name} | {t('Temp')}
                  : {selectedConversation?.temperature} |
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={handleSettings}
                  >
                    <IconSettings size={18} />
                  </button>
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button>
                </div>
                {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )} */}

                {selectedConversation?.messages.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(
                        editedMessage,
                        selectedConversation?.messages.length - index,
                      );
                    }}
                  />
                ))}

                {loading && <ChatLoader />}

                <div
                  className="h-[12px] bg-white dark:bg-[#343541]"
                  ref={messagesEndRef}
                />
              </>
            )}
          </div>

          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            question={result}
            onSend={(message, plugin) => {
              setCurrentMessage(message);
              handleSend(message, 0, plugin);
            }}
            onScrollDownClick={handleScrollDown}
            onDownloadChat={() => {
              if (currentMessage) {
                handleSend(currentMessage, 2, null);
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
          <div className='absolute left-0 right-0 py-2 text-center'>
            <button
              className="bottom-1 mx-2 mb-3 w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {/* {!isRecording?<IconMicrophone size={16} className='float-left mr-1'/> : <IconMicrophoneOff size={16} className='float-left mr-1'/> } */}
              <IconMicrophone size={16} className='float-left mr-1' style={isSending ? { animation: "pulse 1s infinite", borderRadius: "12px" } : {}} />
              {micBtn_caption}
            </button>
            <button
              className="bottom-1 mx-2 mb-3 w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
              onClick={() => {
                setIsDownloadChatDialog_open(true);
              }}
            >
              <IconDownload size={16} className='float-left mr-1' /> {t('Download')}
            </button>
            {/* <p>{result}</p> */}
            <DownloadChatDialog
              open={isDownloadChat_open}
              onClose={() => {
                setIsDownloadChatDialog_open(false);
              }}
            />

            {getCookie('wordpress_userid') === "9999999" && (
              <><style>{`
              @media (max-width: 720px) {
                .max-h-full {
                  max-height: calc(100% - 270px) !important;
                }
              }
              @media (min-width: 720px) {
                .max-h-full {
                  max-height: calc(100% - 340px) !important;
                }
              }
            `}</style>
            <div className='contact_img'></div>
            </>
            )}
          </div>
        </>
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
