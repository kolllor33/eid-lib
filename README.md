# Eid library
This library is created to get a simpel way to interact with the belgian eid middelware for nodejs.

## Usage

```js
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
