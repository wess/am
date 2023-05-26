import {
  Client,
  Databases,
  Query,
  ID,
} from 'appwrite';

import Document from './document';

/**
 * Function to create a Provider for working with 
 * Models and Appwrite's database API.
 * 
 * @param appwrite : Client
 * @param databaseId : string
 * @param collectionId : string
 * 
 * @returns Object of functions for working with a collection
 */
const Provider = <D extends Document>(appwrite:Client, databaseId: string,  collectionId: string) => {
  const database = new Databases(appwrite);

  /**
   * Converts a Document type to an object.
   * 
   * @param document Document
   * @returns {[key:string]: any]}
   */
  const toData = (document:D):{id: string, data: {[key:string]: any}} => {
    return {
      id: document['id'] ?? ID.unique(),
      data: Object.keys(document).reduce((acc, key) => {
        if (key[0] === '$') {
          return acc;
        }
        return {
          ...acc,
          [key]: document[key]
        }
      }, {})
    }
  }

  /**
   * Takes a response from Appwrite API and converts it to the given document type.
   * 
   * @param response : {[key:string]: any}
   * @returns Document
   */
  const mapResponse = (response:{[key:string]: any}):D => {
    const {$id, $collectionId, $databaseId, $permissions, $createdAt, $updatedAt, ...data} = response;

    return <D>{
      id: $id,
      createdAt: $createdAt,
      updatedAt: $updatedAt,  
      ...data
    };
  }

  /**
   * Subscribes to an event from Appwrite's Realtime API.
   * 
   * @param event : string
   * @param callback : Function
   */
  const subscribe = async (event:string, callback:(res) => void) => {
    const ev = 
      event
      .replace('$DB_ID', databaseId)
      .replace('$COLLECTION_ID', collectionId);

    appwrite.subscribe(ev, callback);
  }

  /**
   * Creates a new document in the collection.
   * 
   * @param document : Document
   * @returns Document
   */
  const create = async (document:D):Promise<D> => {
    const {id, data} = toData(document);

    const response = await database.createDocument(
      databaseId,
      collectionId,
      id,
      data
    );

    return mapResponse(response);
  }

  /**
   * Updates a document in the collection.
   * 
   * @param document : Document
   * @param where  : Array<Query>
   * @returns 
   */
  const update = async (document:D, where:Array<Query>):Promise<D> => {
    const {id, ...data} = document;
    
    if(id === null) {
      throw new Error('Updating a document requires an id');
    }

    const response = await database.updateDocument(
      databaseId,
      collectionId,
      id!,
      data,
    );

    return mapResponse(response);
  }

  /**
   * Lists documents in the collection. Starting from offset and returning count.
   * 
   * @param offset : number
   * @param count : number
   * @returns Document[]
   */
  const list = async (offset:number, count: number):Promise<D[]> => {
    const response = await database.listDocuments(
      databaseId,
      collectionId,
      [
        Query.offset(offset),
        Query.limit(count),
      ]
    );

    return response.documents.map(mapResponse);
  }

  /**
   * Finds documents in the collection based on the where query.
   * 
   * @param where : Array<string> (Use Appwrite Query)
   * @returns Document[]
   */
  const find = async (where:Array<string>):Promise<D[]> => {
    const response = await database.listDocuments(
      databaseId,
      collectionId,
      where
    );

    return response.documents.map(mapResponse);
  }

  /**
   * Gets a document from the collection by id.
   * 
   * @param id : string
   * @returns 
   */
  const get = async (id:string):Promise<D> => {
    const response = await database.getDocument(
      databaseId,
      collectionId,
      id
    );

    return mapResponse(response);
  }

  /**
   * Deletes a document from the collection.
   * 
   * @param entity : Document | string
   */
  const remove = async (entity:D|string) => {
    const id = typeof entity === 'string' ? entity : entity['id'];

    if(id === null) {
      throw new Error('Deleting a document requires an id');
    }

    await database.deleteDocument(
      databaseId,
      collectionId,
      id
    );
  }

  return {
    subscribe,
    create,
    update,
    list,
    find,
    get,
    remove,
  }
}


export default Provider;