# @Montoya/address-book-snap-tutorial

A Snap example based on [@MetaMask/template-snap](https://github.com/MetaMask/template-snap). Read below for a tutorial!

## Prerequisites

Before you begin, make sure you have the following installed: 

* [Google Chrome](https://www.google.com/chrome/) 
* [MetaMask Flask](https://metamask.io/flask/)\* 
* [Node.js](https://nodejs.org/) 
* [Yarn](https://yarnpkg.com/)
* A text editor or IDE like [Visual Studio Code](https://code.visualstudio.com/)
* Optionally, a [GitHub account](https://github.com/) and a git client like [GitHub Desktop](https://desktop.github.com/)

\* *Please note: MetaMask Flask is experimental preview software. Please do not use your existing secret recovery phrase or keys with Flask. It is recommended that you create a new SRP for testing with Flask.*

## The 30-Minute Snap Tutorial

In this tutorial, you will learn how to manage state in a Snap and how to present a custom API for Dapps. The Snap you will implement is not meant to be an ideal way to manage an address book but rather to demonstrate some features to get you started building with Snaps. 

_If you have not done so already, you should follow the [5-Minute Snap Tutorial](https://github.com/Montoya/gas-fee-snap#the-5-minute-snap-tutorial) before starting with this tutorial._

First, navigate to the [@MetaMask/template-snap](https://github.com/MetaMask/template-snap) repository and click "Use this template." _Note: this is a different template than the one used in the 5-minute snap tutorial._ Give your new Snap a name, like `address-book-snap`. Clone the respository to your local machine. Open a command line tool and run `./scripts/cleanup.sh` to remove some MetaMask-specific files that will not work outside of the MetaMask GitHub organization. Now you are ready to start modifying the files in your Snap.

### Adding the Manage State Permission to your Snap

Open `snap.manifest.json`. This file has the main configuration details for your Snap. To enable your Snap to store an address book, you need to request the "manage state" permission. You can do this by modifying `initialPermissions` to include this permission, like so: 

```JSON
"initialPermissions": {
  "snap_confirm": {},
  "snap_manageState": {}
},
```

This will enable the use of the `snap_manageState` RPC method. With this method, you can save and retrieve data in your Snap.

### Storing Addresses 

Open `index.html`. This is the test Dapp that is included in the Snaps template. Add a form before the closing `</body>` tag that can be used to store an address and label, like so: 

```HTML
  <button class="connect">Connect</button>
  <button class="sendHello">Send Hello</button>

  <form id="storeAddress">
    <fieldset>
      <legend>Save an address to your address book</legend>
      <label for="nameToStore">Name</label>
      <input type="text" id="nameToStore" name="nameToStore"><br>
      <label for="addressToStore">Address</label> 
      <input type="text" id="addressToStore" name="addressToStore"><br>
      <input type="submit" id="storeAddress" value="Save">
    </fieldset>
  </form>
</body>
```

Next, add some Javascript before the closing `</script>` tag to capture the form input and pass that info to the Snap: 

```Javascript
const storeAddressForm = document.getElementById('storeAddress')
storeAddressForm.addEventListener('submit', storeAddress)

async function storeAddress (e) {
   e.preventDefault() // to prevent default form behavior 

   const name = document.getElementById('nameToStore').value
   const address = document.getElementById('addressToStore').value

   try { 
      const response = await ethereum.request({
         method: 'wallet_invokeSnap', 
         params: [snapId, {
           method: 'storeAddress',
           nameToStore: name, 
           addressToStore: address
         }]
      })
   } catch (err) { 
      console.error(err)
      alert('Problem happened: ' + err.message || err)
   }
}
</script>
```

Finally, add a case to `src/index.js` to handle receiving this request: 

```Javascript
module.exports.onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    case 'storeAddress': 
      return wallet.request({
        method: 'snap_confirm', 
        params: [
          {
            prompt: `Hello, ${origin}!`, 
            description: 
              'This custom confirmation is just for display purposes.',
            textAreaContent: 
              `Name to store: ${request.nameToStore}\n`+
              `Address to store: ${request.addressToStore}`, 
          }, 
        ], 
      }); 
    case 'hello':
```

This is just like the `hello` case, but instead it displays the input name and address. Note the backticks \`\` used instead of apostrophes '' for strings that contain variable references. Also, note that `requestObject` is the object passed to the Snap with the method name and any optional parameters you include. 

Once you have made these changes, you can run the following commands on the command line to build and test your Snap: 

```Shell
yarn install

yarn build

yarn run serve
```

Open the dapp in Google Chrome and click "Connect" to connect and install the Snap, then enter a name and address in the form and click "Save." You should see a confirmation window like the following: 

<img src="tutorial-assets/tutorial-first-confirm.png" width="692" height="452" alt="First Confirmation Attempt">

This is great, but the goal is not to just show the inputs. The goal is to store them! Let's solve that in the next section. 

### Actually Storing Addresses

First, initialize the Snap's state with an empty address book. Add the following code in `src/index.js`: 

```Javascript
module.exports.onRpcRequest = async ({ origin, request }) => {

  let state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  if (!state) {
    state = {book:[]}; 
    // initialize state if empty and set default data
    await wallet.request({
      method: 'snap_manageState',
      params: ['update', state],
    });
  }

  switch (request.method) {
```

This code retrieves the current data stored in the Snap's state, and if that data is not set, initalizes it with an object containing an empty array for the address book: `{book:[]}`. Note that `await` is used because these `wallet.request` calls are normally asynchronous but they need to be executed synchronously here. 

Next, add some code to store the name and address from the form before displaying the confirmation window: 

```Javascript
switch (request.method) {
  case 'storeAddress': 
    state.book.push({
      name:requestObject.nameToStore,
      address:requestObject.addressToStore
    });
    await wallet.request({
      method: 'snap_manageState', 
      params: ['update', state], 
    }); 
    return wallet.request({
      method: 'snap_confirm', 
```

This code adds the new name and address to the end of the address book, and then updates the wallet state. 

Finally, display the result of this request in the confirmation window: 

```Javascript
  return wallet.request({
    method: 'snap_confirm', 
    params: [
      {
        prompt: `Hello, ${origin}!`, 
        description: 
          'The address has been saved to your address book',
        textAreaContent: 
          `Name: ${request.nameToStore}\n`+
          `Address: ${request.addressToStore}\n`+
          `Addresses in book: ${state.book.length}`,  
      }, 
    ], 
  }); 
case 'hello':
```

Build and run your Snap again, reload the companion Dapp, and follow the same steps to add an address. You should see a result like this: 

<img src="tutorial-assets/tutorial-second-confirm.png" width="692" height="406" alt="Second Confirmation Attempt">

You can continue adding addresses and clicking Save, and the number of addresses will increase each time, like so: 

<img src="tutorial-assets/tutorial-third-confirm.png" width="692" height="402" alt="Third Confirmation Attempt">

So far, so good! The next step is to try retrieving this data. 

### Getting Stored Addresses

The simplest way to view the stored addresses is to output the array in another confirmation window. Update the `hello` case to do this: 

```Javascript
case 'hello':
  let address_book = state.book.map(function(item){
      return `${item.name}: ${item.address}`; 
    }).join("\n"); 
  return wallet.request({
    method: 'snap_confirm',
    params: [
      {
        prompt: `Hello, ${origin}!`,
        description: 'Address book:',
        textAreaContent: address_book,
      },
    ],
  });
default:
```

This code does a quick string conversion of the address book object (`map` each object in the array, then `join` the array) and outputs that in the `textAreaContent` field of the confirmation window. Build the Snap, connect to the Dapp, and click the "Send Hello" button to see the result: 

<img src="tutorial-assets/tutorial-show-addresses.png" width="362" height="284" alt="See addresses in confirmation">

Note that you did not need to add addresses to the address book again before showing the addresses that are stored. The addresses you added earlier were persisted even after updating the Snap! The data was fetched with this code which you added earlier in this tutorial: 

```Javascript
let state = await wallet.request({
  method: 'snap_manageState',
  params: ['get'],
});
```

As the Snap developer, you are responsible for managing this data &mdash; it's up to you to decide when to update it or clear it. 

So now you have everything you need to store and retrieve data in a Snap! Read on to learn how to make this Snap a bit more useful. 

### Providing an Address Book API

Add another case to `src/index.js` to return the address book: 

```Javascript
  }); 
case 'retrieveAddresses': 
  return state.book; 
case 'hello':
```

Add a button to `index.html` to retrieve addresses: 

```HTML
<button class="connect">Connect</button>
<button class="sendHello">Send Hello</button> 
<button class="getAddresses">Get Addresses</button>

<form id="storeAddress">
```

And add a container before the closing `body` tag to display the address book: 

```HTML
  </form>

  <div>
    <p>My address book</p>
    <pre id="addressBook"></pre>
  </div>
</body>
```

Add the following code to the script section of `index.html` to retrieve and display the address book inside the Dapp: 

```JavaScript
const connectButton = document.querySelector('button.connect')
const sendButton = document.querySelector('button.sendHello')
const getButton = document.querySelector('button.getAddresses'); 

connectButton.addEventListener('click', connect)
sendButton.addEventListener('click', send)
getButton.addEventListener('click',getAddresses); 
```

```JavaScript
async function getAddresses () { 
  let response = []; 
  try { 
    response = await ethereum.request({
      method: 'wallet_invokeSnap', 
      params: [snapId, {
        method: 'retrieveAddresses'
      }]
    })
  } catch (err) { 
    console.error(err)
    alert('Problem happened: ' + err.message || err)
  }
  document.getElementById('addressBook').textContent = ''+response.map(function(item){
      return `${item.name}: ${item.address}`; 
    }).join("\n"); 
}
```

This is very similar to the other button handlers, but instead of just invoking a Snap request, it captures the response from that request and then injects it into the Dapp webpage. Build and run the Snap again, refresh the Dapp page, click "Connect" and click "Get Addresses." You will see a result like the following: 

<img src="tutorial-assets/tutorial-inject-addresses.png" width="572" height="510" alt="Injected addresses">

You now have a very simple API for making an address book available to Dapps. While this is far from being an elegant approach to making an address book inside of MetaMask, you have the foundation for storing and retrieving data with a custom Snap. Read on for some ideas on how to make this more elegant and secure. 

### Making the Dapp more responsive

One way to make the Dapp more responsive is to load the address book as soon as you connect. Just add `getAddresses()` to the end of the "Connect" handler: 

```JavaScript
async function connect () {
  await ethereum.request({
    method: 'wallet_enable',
    params: [{
      wallet_snap: { [snapId]: {} },
    }]
  })
  getAddresses()
}
```

Another is to refresh the in-page address book each time you add a new address. Same approach, add `getAddresses()` right after the call to store an address in the form handler: 

```JavaScript
async function storeAddress (e) {
  e.preventDefault() // to prevent default form behavior 

  const name = document.getElementById('nameToStore').value
  const address = document.getElementById('addressToStore').value

  try { 
    const response = await ethereum.request({
      method: 'wallet_invokeSnap', 
      params: [snapId, {
        method: 'storeAddress',
        nameToStore: name, 
        addressToStore: address
      }]
    })
    getAddresses()
  } catch (err) { 
    console.error(err)
    alert('Problem happened: ' + err.message || err)
  }
}
```

This will update the in-page address book as soon as you Approve, Reject or dismiss the confirmation window that pops up. However, since you now have the address book being displayed and updated in real-time inside the Dapp, you could skip using the confirmation window entirely, like so: 

```JavaScript
switch (request.method) {
  case 'storeAddress': 
    state.book.push({
      name:request.nameToStore,
      address:request.addressToStore
    });
    await wallet.request({
      method: 'snap_manageState', 
      params: ['update', state], 
    }); 
    return true; 
  case 'retrieveAddresses': 
```

Now, the Snap will quietly update the state in the background, and you will immediately see the address book being updated in-page. Going forward, you could update the `storeAddress` code to make the Snap more useful, by: 

* Checking that the input name and address conforms to some rules, such as "names and addresses can only contain letters and/or numbers" and "addresses must map to various protocol standards (depending on which blockchains you wish to support)." 
* Check for duplicate names and addresses. Right now it's possible to add the same name multiple times, which is not very useful. One option would be to filter the existing data to check if the user is adding something that is already there, and either update it or return an error. 
* Use a data type that is more useful than an array, to enable easier lookup, sorting, etc. 

Also, right now the Snap is not secure &mdash; any Dapp could add or change addresses,  without the user's permission! This could open the user up to attacks, such as tricking them into sending cryptocurrency to the wrong address. One way to fix this is to publish the address book manager to a specific domain, like "myaddressbook.xyz," and then check the `originString` in the `storeAddress` case to make sure that the request is only coming from this domain. This way, as long as you retain control of the domain, only the Dapp at that domain can make changes to the address book data. Another way to fix this is to require the confirmation window in the control flow for storing addresses, and only store the address if the user clicks approve. This way, the user will always get an explicit popup when an address update is attempted, will see the data that is being added or updated, and will have the option to explicitly allow or deny that change. Any Dapp could provide the functionality to add or update addresses, but the user would still be in control of whether their data is changed. 

Lastly, the Dapp interface could be made more useful by allowing the user to update or remove individual addresses, sort addresses (with an update to the address book made each time the user changes the order), and interact with these address (like adding a send button to open the send flow in MetaMask for that address). With the native MetaMask APIs you can create a fully-featured address book Dapp for managing addresses and interacting with those addresses, even displaying information for each address (such as balances or last transaction) in a way that preserves the privacy and anonymity of the end user (because the stored data is visible only to the user's device, not to you or MetaMask, and the user has full control of when and how they store and view that data). 

_An example Snap and Dapp with these improvements will be made available for reference soon._

Now that you've come this far, check out the [Password Manager](https://github.com/ritave/snap-passwordManager) snap which uses encryption to store usernames and passwords securely inside of a Snap!
