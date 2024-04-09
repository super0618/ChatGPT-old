import type { NextApiRequest, NextApiResponse } from 'next'
import { OPENAI_API_KEY } from '@/utils/app/const';

import formidable from 'formidable';
import type {File} from 'formidable';

export const config = {
  api: {
      bodyParser: false,
  }
};
const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 2,
  allowEmptyFiles: false,
  multiples: false,
};

// promisify formidable
function formidablePromise(
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0]
): Promise<{fields: formidable.Fields; files: formidable.Files}> {
  return new Promise((accept, reject) => {
    const form = formidable(opts);
    form.parse(req, (err, fields, files) => {
        if (err) {
            return reject(err);
        }
        return accept({fields, files});
    });
  });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let resultBody;
  let status = 200;
  try{
    if (req.method === 'POST') {

      let audioFileName;
      const chunks: never[] = [];

      const {fields, files} = await formidablePromise(req, {
        ...formidableConfig,
      });

      audioFileName = (files.file as File).filepath;
      try {
        const { Configuration, OpenAIApi } = require("openai");
        const fs = require("fs");
        
        const configuration = new Configuration({
          apiKey: OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const resp = await openai.createTranscription(
          fs.createReadStream(audioFileName),
          "whisper-1"
        );
        console.log(resp.data.text);
        resultBody = {
          Status: 'ok', Text: resp.data.text
        }
        fs.unlinkSync(audioFileName);
      }  catch (e) {
        // Handle any other HTTP method
        status = 500;
        resultBody = {
          status: 'fail', message: 'openAI createTranscription error'
        }
      }
    }else{
      status = 500;
      resultBody = {
        status: 'fail', message: 'Invalid request'
      }
  }
  } catch (error) {
    console.error(error);
    status = 500;
    resultBody = {
      status: 'fail', message: 'Upload error'
    }
  }
  res.status(status).json(resultBody);
}

export default handler;
