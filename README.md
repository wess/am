<p style="color:red">Still a work in progress, but so far so good.</p>

# AM (Appwrite Modeling)
> A small library that uses model definitions and Provider to simplify working with Appwrite database API.

Example:
```typescript

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
```

# Contributing
Contributions are welcome, just make a pull request. If you are including new functionality, please write a usage example, and include any information that will impact installation and/or setup.

# License
*AM* is released under the MIT license. See LICENSE for details.

# Get in touch
- [@wesscope](https://twitter.com/wesscope)
- [wess on Appwrite discord](https://discord.com/invite/GSeTUeA)