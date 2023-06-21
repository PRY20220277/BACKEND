import moment from 'moment';
import axios, { ResponseType } from 'axios';
import sizeOf from 'image-size';
import { promisify } from 'util';
import * as ytdl from 'ytdl-core';
import * as FormData from 'form-data';
// import sharp from 'sharp';
import { Pixelate } from './distortion/pixelate';
// import { createCanvas, loadImage } from 'canvas';
import { toPng } from 'html-to-image';
import { JSDOM } from 'jsdom';

export class Util {
  toDate(date?: string): string {
    if (!date) return null;

    return moment(date).toString();
  }

  parseDate(date?: Date, withHour = true): string {
    if (!date) return null;

    const day = moment(date).format('DD/MM/YYYY');
    const hour = moment(date).format('HH:mm');

    if (withHour) {
      return day + hour;
    }

    return day;
  }

  async downloadFromURL(
    url: string,
    responseType?: ResponseType,
  ): Promise<any> {
    responseType = responseType ?? 'arraybuffer';
    const response = await axios.get(url, {
      responseType: responseType,
    });
    return response.data;
  }

  async downloadAudioFromYoutubeURL(url: string): Promise<any> {
    const audio = await this.getAudioURL(url);
    const audioStream = await this.downloadFromURL(audio.url);
    return audioStream;
  }

  async getAudioInfoFromYoutubeURL(url: string): Promise<any> {
    const audioStream = await ytdl.getInfo(url);
    return audioStream.videoDetails;
  }

  async getImageInfoFromURL(url: string): Promise<any> {
    const data = await this.downloadFromURL(url);
    const dimensions = sizeOf(data);

    return {
      width: dimensions.width,
      height: dimensions.height,
      type: dimensions.type,
    };
  }

  getImageInfoFromBuffer(buffer: Buffer): any {
    const dimensions = sizeOf(buffer);

    return {
      width: dimensions.width,
      height: dimensions.height,
      type: dimensions.type,
    };
  }

  async getAudioInfoFromStream(stream: any): Promise<any> {
    const { format } = await (
      await import('music-metadata')
    ).parseStream(stream);

    const bitrate = format.bitrate ? format.bitrate / 1250 : null;
    const sampleRate = format.sampleRate ? format.sampleRate / 430 : null;

    return bitrate ?? sampleRate;
  }

  async distortImage(imageStream: any, decibelAverage: number): Promise<any> {
    const distortionType = this.getDistortionType(decibelAverage);

    const distortionImage = await this.distortImageStream(
      imageStream,
      distortionType,
    );
    return distortionImage;
  }

  private getDistortionType(decibelAverage: number): string {
    // https://hearinghealthfoundation.org/keeplistening/decibels

    const averageTone = Math.floor(decibelAverage);
    let distortionType = 'DEF-651C';

    if (averageTone >= 0 && averageTone <= 20) {
      distortionType = 'PCS-259G';
    } else if (averageTone >= 21 && averageTone <= 30) {
      distortionType = 'KLG-985C';
    } else if (averageTone >= 31 && averageTone <= 50) {
      distortionType = 'SEC-756G';
    } else if (averageTone >= 51 && averageTone <= 60) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 61 && averageTone <= 70) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 71 && averageTone <= 75) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 76 && averageTone <= 80) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 81 && averageTone <= 85) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 86 && averageTone <= 90) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 91 && averageTone <= 95) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 96 && averageTone <= 100) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 101 && averageTone <= 105) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 106 && averageTone <= 110) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 110 && averageTone <= 120) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 121 && averageTone <= 130) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 131 && averageTone <= 135) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 136 && averageTone <= 140) {
      distortionType = 'PLS-320C';
    } else if (averageTone >= 141) {
      distortionType = 'PLS-320C';
    }

    return distortionType;
  }

  private async distortImageStream(
    imageUrl: any,
    distortion: string,
  ): Promise<string> {
    const width = 1024; // Width of the canvas
    const height = 1024; // Height of the canvas

    const canvas = createCanvas(width, height) as any;
    const context = canvas.getContext('2d');

    const htmlContent = Pixelate(imageUrl, 20);
    const dom = new JSDOM(htmlContent);
    const dataUrl = await toPng(dom);
    return dataUrl;
  }

  private async getAudioURL(url: string): Promise<any> {
    const formData1 = new FormData();
    formData1.append('q', url);
    formData1.append('vt', 'mp3');

    const info1 = await axios.post(
      'https://yt5s.io/api/ajaxSearch',
      formData1,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    const formData2 = new FormData();
    formData2.append('v_id', info1.data.vid);
    formData2.append('ftype', 'mp3');
    formData2.append('fquality', '128');
    formData2.append('token', info1.data.token);
    formData2.append('timeExpire', info1.data.timeExpires);
    formData2.append('client', 'yt5s.io');

    const info2 = await axios.post(
      'https://backend.svcenter.xyz/api/convert-by-45fc4be8916916ba3b8d61dd6e0d6994',
      formData2,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return info2.data;
  }
}
