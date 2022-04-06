wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'storeAddress': 
      return wallet.request({
        method: 'snap_confirm', 
        params: [
          {
            prompt: `Hello, ${originString}!`, 
            description: 
              'This custom confirmation is just for display purposes.',
            textAreaContent: 
              `Name to store: ${requestObject.nameToStore}\n`+
              `Address to store: ${requestObject.addressToStore}`, 
          }, 
        ], 
      }); 
    case 'hello':
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Hello, ${originString}!`,
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              'But you can edit the snap source code to make it do something, if you want to!',
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
});
