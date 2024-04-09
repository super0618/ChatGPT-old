import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE, GPT_QUESTION_LIMIT } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';

import { ChatBody, Message } from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
import axios from "axios";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

export const config = {
  runtime: 'edge',
};

async function get_gpt_limit_count (ip:string, userid:number) {
  var result = {ip_gpt_count:Number, ip_gpt_limit:Number};
  try {
    const response = await axios.request({
      url: 'https://chatgpt.co.il/wp-json/wp/v2/gpt-limit-count?ip='+ip+'&userid='+userid.toString(),  
      method: 'get', 
      adapter: fetchAdapter
    });
    if(response.data) {
      const result = {
        ip_gpt_count: response.data['gpt_question_count'],
        ip_gpt_limit: response.data['gpt_question_limit'] ?? GPT_QUESTION_LIMIT
      };

      return result;
    }
    else
      return { ip_gpt_count: 0, ip_gpt_limit: GPT_QUESTION_LIMIT };
  } catch (error) {
    console.error(error);
  }  
}

const update_gpt_limit_count = async(ip:string, userid:number) => {
  try {
    const response = await fetch(
      'https://chatgpt.co.il/wp-json/wp/v2/gpt-limit-count?ip='+ip+'&userid='+userid.toString(),{
      method: 'post',
    });
    console.log(response.text);
  } catch (error) {
    console.error(error);
  }
}

function getClientIpFromXForwardedFor(value:any) {
  var is = require('./is');
  if (!is.existy(value)) {
    return null;
  }

  if (is.not.string(value)) {
    throw new TypeError("Expected a string, got \"".concat((value), "\""));
  }

  var forwardedIps = value.split(',').map(function (e:any) {
    var ip = e.trim();

    if (ip.includes(':')) {
      var splitted = ip.split(':');

      if (splitted.length === 2) {
        return splitted[0];
      }
    }

    return ip;
  });

  for (var i = 0; i < forwardedIps.length; i++) {
    if (is.ip(forwardedIps[i])) {
      return forwardedIps[i];
    }
  }

  return null;
}

function getClientIp(req:any) : any {
  var is = require('./is');
  const headers = Object.fromEntries(req.headers.entries());
  if (req.headers) {
    if (is.ip(headers['x-real-ip'])) {
      return headers['x-real-ip'];
    }

    var xForwardedFor = getClientIpFromXForwardedFor(headers['x-forwarded-for']);

    if (is.ip(xForwardedFor)) {
      return xForwardedFor;
    }

    if (is.ip(headers['cf-connecting-ip'])) {
      return headers['cf-connecting-ip'];
    }

    if (is.ip(headers['fastly-client-ip'])) {
      return headers['fastly-client-ip'];
    }

    if (is.ip(headers['true-client-ip'])) {
      return headers['true-client-ip'];
    }

    if (is.ip(headers['x-real-ip'])) {
      return headers['x-real-ip'];
    }

    if (is.ip(headers['x-cluster-client-ip'])) {
      return headers['x-cluster-client-ip'];
    }

    if (is.ip(headers['x-forwarded'])) {
      return headers['x-forwarded'];
    }

    if (is.ip(headers['forwarded-for'])) {
      return headers['forwarded-for'];
    }

    if (is.ip(headers.forwarded)) {
      return headers.forwarded;
    }

    if (is.ip(headers['x-appengine-user-ip'])) {
      return headers['x-appengine-user-ip'];
    }
  }

  if (is.existy(req.connection)) {
    if (is.ip(req.connection.remoteAddress)) {
      return req.connection.remoteAddress;
    }

    if (is.existy(req.connection.socket) && is.ip(req.connection.socket.remoteAddress)) {
      return req.connection.socket.remoteAddress;
    }
  }

  if (is.existy(req.socket) && is.ip(req.socket.remoteAddress)) {
    return req.socket.remoteAddress;
  }

  if (is.existy(req.info) && is.ip(req.info.remoteAddress)) {
    return req.info.remoteAddress;
  }

  if (is.existy(req.requestContext) && is.existy(req.requestContext.identity) && is.ip(req.requestContext.identity.sourceIp)) {
    return req.requestContext.identity.sourceIp;
  }

  if (headers) {
    if (is.ip(headers['Cf-Pseudo-IPv4'])) {
      return headers['Cf-Pseudo-IPv4'];
    }
  }

  if (is.existy(req.raw)) {
    return getClientIp(req.raw);
  }

  return null;
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, key, prompt, temperature, userid } = (await req.json()) as ChatBody;
    const stream = await OpenAIStream(model, prompt, temperature, "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", messages);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
