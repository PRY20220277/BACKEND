import { Container, CosmosClient } from '@azure/cosmos';

export class CosmosDBClient {
  private client: CosmosClient;
  private container: Container;

  constructor(containerId: string) {
    this.client = new CosmosClient({
      endpoint: process.env.DEEP_ART_COSMOS_ENDPOINT,
      key: process.env.DEEP_ART_COSMOS_API_KEY,
    });
    this.container = this.client
      .database(process.env.DEEP_ART_COSMOS_DATABASE_ID)
      .container(containerId);
  }

  async query(query: string): Promise<any> {
    const { resources } = await this.container.items.query(query).fetchAll();
    return resources;
  }

  async fetchAll() {
    const { resources } = await this.container.items.readAll().fetchAll();
    return resources;
  }

  async getById(documentId: any) {
    const { resource } = await this.container.item(documentId).read();
    return resource;
  }

  async create(document: any) {
    const { resource: createdDocument } = await this.container.items.create(
      document,
    );
    return createdDocument;
  }

  async update(documentId: any, document: any) {
    const existingDocument = await this.getById(documentId);
    const updatedDocument = { ...existingDocument, ...document };
    const { resource } = await this.container
      .item(documentId)
      .replace(updatedDocument);
    return resource;
  }

  async delete(documentId: any) {
    const { resource } = await this.container.item(documentId).delete();
    return resource;
  }
}
