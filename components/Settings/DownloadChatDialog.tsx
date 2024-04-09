import { IconPhoto, IconBrandAdobe, IconBrandOffice } from '@tabler/icons-react';
import { FC, useContext, useState, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import { getSettings, saveSettings } from '@/utils/app/settings';
import { Settings } from '@/types/settings';
import HomeContext from '@/pages/api/home/home.context';
import downloadjs from 'downloadjs';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

import { on } from 'events';

interface Props {
  open: boolean;
  onClose: () => void;
}

  export const DownloadChatDialog = ({ open, onClose }: Props) => {
  const { t } = useTranslation('settings');
  const settings: Settings = getSettings();
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(true);

  const DownloadImage = async () => {
    const canvas = await html2canvas(document.getElementById('main_chatbox') as HTMLElement, 
    {allowTaint: true,
      useCORS: true,
      logging: false,
      windowHeight: window.outerHeight + window.innerHeight});
    const dataURL = canvas.toDataURL('image/png');
    downloadjs(dataURL, 'chat_history.png', 'image/png');
  };

  const DownloadPDF = async ()  => {
    html2canvas(document.getElementById('main_chatbox') as HTMLElement, 
      {allowTaint: true,
        useCORS: true,
        logging: false,
        windowHeight: window.outerHeight + window.innerHeight}).then((canvas) => 
    {
        const dataURL = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF();
        const imgProps= pdf.getImageProperties(dataURL);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        console.log(canvas.width, canvas.height);
        console.log(pdfWidth, pdfHeight);
        pdf.addImage(dataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save("chat_history.pdf");
    })
  };

  const DownloadWord = async ()  => {
    const htmlEl = document.getElementById('main_chatbox') as HTMLElement;
    asBlob(htmlEl.innerHTML).then(data => {
      saveAs(data as string | Blob, 'chat_history.docx') // save as docx file
    }) // asBlob() return Promise<Blob|Buffer>
  };

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
  if(showModal){
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
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-sm mb-2 text-black dark:text-neutral-200">
              {t('Download Chat')}
            </div>
            <button
              className="absolute top-3 right-3 hover:bg-gray-200 hover:text-gray-900 rounded text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => onClose()}
            >
              <span className="text-black opacity-7 h-8 w-8 text-2xl block py-0 rounded text-gray-400 ">
                x
              </span>
            </button>
            <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex gap-4">
              <div>
                <button 
                  className="mb-3 flex w-fit items-center gap-3 rounded border dark:bg-emerald-600 dark:text-white border-neutral-200 bg-white py-2 px-2 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
                  onClick={() => {
                    DownloadImage();
                  }}
                >{<IconPhoto size={18} />}{t('Image')}
              </button>
              </div>
              <div>
                <button 
                  className="mb-3 flex w-fit items-center gap-3 rounded border dark:bg-emerald-600 dark:text-white border-neutral-200 bg-white py-2 px-2 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
                  onClick={() => {
                    DownloadPDF();
                  }}
                >{<IconBrandAdobe size={18} />}{t('PDF')}
                </button>
              </div>
              <div>
                <button 
                  className="mb-3 flex w-fit items-center gap-3 rounded border dark:bg-emerald-600 dark:text-white border-neutral-200 bg-white py-2 px-2 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
                  onClick={() => {
                    DownloadWord();
                  }}
                >{<IconBrandOffice size={18} />}{t('Word')}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }else{
    return <></>;
  }
};
