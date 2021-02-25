# Eid library
This library is created to get a simpel way to interact with the belgian eid middelware for nodejs.

### Installation
```bash
npm i --save eid-lib
```

## Basic usage

```js
    // beidpkcs11.dll is the name of the module aka the library you need to interact with
    const CardReader = require("eid-lib");
    const cardReader = new CardReader("beidpkcs11.dll");
    try {
        /**
         * your code
         */
    } catch (e) {
        console.error(e);
    } finally {
        // needs to be call before ending program!!
        cardReader.Finalize();
    }
```

### Getting data

```js
    const CardReader = require("eid-lib");
    const cardReader = new CardReader("beidpkcs11.dll");
    try {
        if(cardReader.HasCard()) {
            const firstname = cardReader.GetFirstName();
        } else {
            console.log("No card detected")
        }
    } catch (e) {
        console.error(e);
    } finally {
        // needs to be call before ending program!!
        cardReader.Finalize();
    }
```

### Getting files
Every on the card is stored in files.

```js
    const CardReader = require("eid-lib");
    const cardReader = new CardReader("beidpkcs11.dll");
    try {
        const photoBuffer = cardReader.GetPhotoFile();
        //photoBuffer will contain a Buffer of a png image of the image on the card
        //you can write it to a file photo.png for example
    } catch (e) {
        console.error(e);
    } finally {
        // needs to be call before ending program!!
        cardReader.Finalize();
    }
```

### Getting public certificate

```js
    const CardReader = require("eid-lib");
    const cardReader = new CardReader("beidpkcs11.dll");
    try {
        const authPubKey = cardReader.GetCertificateAuthenticationFile();
        //this is the public key of the authentication key it will return a der formated file
        const pemCert = cardReader._derToPem(authPubKey);
        //PemCert will contain a string that is the pem format of the der format. 
    } catch (e) {
        console.error(e);
    } finally {
        // needs to be call before ending program!!
        cardReader.Finalize();
    }
```

### Sign and Verify data
You can sign data with your cards private key and then verifing it with the public key.

```js
    const Assert = require('assert').strict;
    const CardReader = require("eid-lib");
    const cardReader = new CardReader("beidpkcs11.dll");
    try {
        if(cardReader.HasCard()) {
            // Sign
            const testdata = Buffer.from(["0", "1", "2", "3", "4", "5", "6", "7", "8" ]);
            // after calling this the middelware will ask you your pin code
            let signeddata = cardReader.SignWithCard(testdata, "Authentication");

            Assert.notStrictEqual(signeddata, null);
            // Verification
            Assert.strictEqual(cardReader.Verify(testdata, signeddata, cardReader.GetCertificateAuthenticationFile()), true);

            // Sign and Verify a file on the card
            const idFile = cardReader.GetIdFile();
            const idSignatureFile = cardReader.GetIdSignatureFile();
            const certificateRRN = cardReader.GetCertificateRNFile();
            Assert.strictEqual(cardReader.Verify(idFile, idSignatureFile, certificateRRN), true);
        } else {
            console.log("No card detected")
        }
    } catch (e) {
        console.error(e);
    } finally {
        cardReader.Finalize();
    }
```

### Encrypted and Decrypted data
You can encrypted data with your cards and then decrypte it.

```js
    const CardReader = require("eid-lib");
    const cardReader = new CardReader("beidpkcs11.dll");
    try {
        const testdata = Buffer.from(["0", "1", "2", "3", "4", "5", "6", "7", "8" ]);
        if(cardReader.HasCard()) {
            // after calling this the middelware will ask you your pin code
            const data = cardReader.EncrypteData(testdata);
            console.log(data);
            console.log();
            //output: ☺☻♥♦♣♠
            console.log(cardReader.DecrypteData(data).toString());
        } else {
            console.log("No card detected");
        }
    } catch (e) {
        console.error(e);
    } finally {
        cardReader.Finalize();
    }
```

