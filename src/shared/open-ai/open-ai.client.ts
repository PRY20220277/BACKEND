import { Configuration, CreateImageRequest, OpenAIApi } from 'openai';

export class OpenAIClient {
  private readonly client: OpenAIApi;
  private readonly configuration: Configuration = new Configuration({
    apiKey: process.env.DEEP_ART_OPENAI_API_KEY,
  });

  constructor() {
    this.client = new OpenAIApi(this.configuration);
  }

  async generateImages(request: CreateImageRequest): Promise<any> {
    const result = await this.client.createImage(request);
    return result.data?.data;
  }

  async generateVariationFromImage(image: any, n: number): Promise<any> {
    const result = await this.client.createImageVariation(image, n);
    return result.data?.data;
  }
}
