import { MongoClient, Collection, ObjectId, Long } from 'mongodb';
import { logger, tools } from 'mylife-home-common';
import { Sequence } from './sequence';
import { CompletionBag } from './completion-bag';

const log = logger.createLogger('mylife:home:collector:database:writer');

interface DataHeader {
  _id: ObjectId;
  seqnum: Long;
}

type DataRecord<T> = T & DataHeader;

export class Writer<T> {
  private readonly sequence = new Sequence();
  private client: MongoClient;
  private collection: Collection<DataRecord<T>>;
  private readonly completionBag = new CompletionBag();

  constructor(private readonly collectionName: string) {
  }

  async init() {
    const url = tools.getConfigItem<string>('database');

    this.client = await MongoClient.connect(url);

    const dbName = new URL(url).pathname.substring(1);
    const db = this.client.db(dbName);

    this.collection = db.collection<DataRecord<T>>(this.collectionName);
  }

  async terminate() {
    await this.completionBag.wait();

    this.collection = null;
    await this.client.close();
    this.client = null;
  }

  write(object: T) {
    const data: DataRecord<T> = {
      _id: new ObjectId(),
      seqnum: new Long(this.sequence.next()),
      ...object
    };

    // Seems that _id typing is broken.
    // Note: we do not handle exception, we want to fail if we cannot write to mongo.
    const task = this.collection.insertOne(data as any);

    this.completionBag.addTask(task);
  }
}
