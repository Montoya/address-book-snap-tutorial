# @Montoya/address-book-snap

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

If you have not done so already, you should follow the [5-Minute Snap Tutorial](https://github.com/Montoya/gas-fee-snap#the-5-minute-snap-tutorial) before starting with this tutorial. 

First, navigate to the [@MetaMask/template-snap](https://github.com/MetaMask/template-snap) repository and click "Use this template." Give your new Snap a name, like `address-book-snap`. Clone the respository to your local machine. Open a command line tool and run `./scripts/cleanup.sh` to remove some MetaMask-specific files that will not work outside of the MetaMask GitHub organization. Now you are ready to start modifying the files in your Snap.

### Adding the Manage State Permission to your Snap

Open `snap.manifest.json`. This file has the main configuration details for your Snap. To enable your Snap to store an address book, you need to request the "manage state" permission. You can do this by modifying `initialPermissions` to include this permission, like so: 