wallet.registerRpcMessageHandler(async (originString, requestObject) => {

  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  if (!state) {
    // initialize state if empty and set default data
    await wallet.request({
      method: 'snap_manageState',
      params: ['update', {book:[]}],
    });
  }

  switch (requestObject.method) {
    case 'storeAddress': 
      let state = await wallet.request({
        method: 'snap_manageState', 
        params: ['get'], 
      }); 
      let address_book = state.book; 
      address_book.push({
        name:requestObject.nameToStore,
        address:requestObject.addressToStore
      });
      await wallet.request({
        method: 'snap_manageState', 
        params: ['update', {book:address_book}], 
      }); 
      return wallet.request({
        method: 'snap_confirm', 
        params: [
          {
            prompt: `Hello, ${originString}!`, 
            description: 
              'The address has been saved to your address book',
            textAreaContent: 
              `Name: ${requestObject.nameToStore}\n`+
              `Address: ${requestObject.addressToStore}\n`+
              `Addresses in book: ${address_book.length}`,  
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
