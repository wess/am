import {
  Client,
  Provider,
  Document,
  Events,
} from '.';


const appwrite = new Client();

appwrite
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('<PROJECT_ID>');

const DB_ID = '<Database ID>';
const COLLECTION_ID = '<Collection ID>';


interface Message extends Document {
  user: string,
  message: string,
}

const MessageProvider = Provider<Message>(appwrite, DB_ID, COLLECTION_ID);

MessageProvider.subscribe(Events.create, response => console.log(`New message: ${response.$id}`));

MessageProvider.list(0, 10).then((messages) => {
  console.log(messages);
});

const test:Message = {
  message: 'Hello World',
  user: 'test',
};

MessageProvider.create(test).then((message) => {
  console.log(message);
});