const pkcs11js = require("pkcs11js");
const { createVerify } = require("crypto")

class CardReader {

    constructor(moduleFileName) {
        this.pkcs11 = new pkcs11js.PKCS11();
        this.pkcs11.load(moduleFileName || "beidpkcs11.dll");
        this.Init();

        this.objectNames = [
            "ATR",
            "CARD_DATA",
            "carddata_serialnumber",
            "carddata_comp_code",
            "carddata_os_number",
            "carddata_os_version",
            "carddata_soft_mask_number",
            "carddata_soft_mask_version",
            "carddata_appl_version",
            "carddata_glob_os_version",
            "carddata_appl_int_version",
            "carddata_pkcs1_support",
            "carddata_key_exchange_version",
            "carddata_appl_lifecycle",
            "DATA_FILE",
            "card_number",
            "chip_number",
            "validity_begin_date",
            "validity_end_date",
            "issuing_municipality",
            "national_number",
            "surname",
            "firstnames",
            "first_letter_of_third_given_name",
            "nationality",
            "location_of_birth",
            "date_of_birth",
            "gender",
            "nobility",
            "document_type",
            "special_status",
            "photo_hash",
            "ADDRESS_FILE",
            "address_street_and_number",
            "address_zip",
            "address_municipality",
            "PHOTO_FILE",
            "CERT_RN_FILE",
            "SIGN_DATA_FILE",
            "SIGN_ADDRESS_FILE",
        ];
        Object.freeze(this.objectNames);
    }

    /**
     * Initialize the module.
     */
    Init() {
        this.pkcs11.C_Initialize();
    }

    /**\
     * Call this function at the end of your code. 
     * This will end the conversation with the cardreader and you will need to initialize again.
     */
    Finalize() {
        this.pkcs11.C_Finalize();
    }

    /**
    * Gets the a List of solts(cardreader) found
    * @param {Boolean} searchCards search cards(true) or only cardreades(false) default is false
    * @returns List of slots
    */
    GetSlotList(searchCards = false) {
        try {
            return this.pkcs11.C_GetSlotList(searchCards);
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * Get the first available slot that has a card in it.
     * @returns A slot
     */
    GetAvailableSlot() {
        const slots = this.GetSlotList(true);
        if (slots.length == 0)
            return null
        return slots[0];
    }

    /**
    * Gets the description of the first slot (cardreader) found
    * @param slot a slot
    * @returns Description of the first slot found
    */
    GetSlotDescription(slot) {
        return this.pkcs11.C_GetSlotInfo(slot);
    }


    /**
    * Tries to create a Session, returns NULL in case of failure
    * @param {Buffer} slot a slot
    * @returns A session or null
    */
    CreateSession(slot) {
        try {
            return this.pkcs11.C_OpenSession(slot, pkcs11js.CKF_RW_SESSION | pkcs11js.CKF_SERIAL_SESSION);
        } catch {
            return null;
        }
    }

    /**
    * Gets label of token found in the first non-empty slot (cardreader)
    * @param {Buffer} slot A slot
    * @returns token info of a slot
    */
    GetTokenInfo(slot) {
        let tokenInfoLabel;
        try {
            tokenInfoLabel = this.pkcs11.C_GetTokenInfo(slot);
        } catch (err) {
            console.log(err)
        }
        return tokenInfoLabel;
    }

    /**
    * Get special status of the owner of the card
    * @returns special status string
    */
    GetSpecialStatus() {
        return this.GetData("special_status");
    }

    /**
    * Get firstname of the owner of the card
    * @returns firstname string
    */
    GetFirstName() {
        return this.GetData("firstnames");
    }

    /**
    * Get surname of the owner of the card
    * @returns surname string
    */
    GetSurname() {
        return this.GetData("surname");
    }

    /**
    * Get birth date of the owner of the card
    * @returns birth date string
    */
    GetDateOfBirth() {
        return this.GetData("date_of_birth");
    }

    /**
    * Get gender of the owner of the card
    * @returns gender string
    */
    GetGender() {
        return this.GetData("gender");
    }

    /**
    * Get nationality of the owner of the card
    * @returns nationality string
    */
    GetNationality() {
        return this.GetData("nationality");
    }

    /**
    * Get national number of the owner of the card
    * @returns national number string
    */
    GetNationalNumber() {
        return this.GetData("national_number");
    }

    /**
    * Get location of birth of the owner of the card
    * @returns location of birth string
    */
    GetLocationOfBirth() {
        return this.GetData("location_of_birth");
    }

    /**
    * Get street and number of the owner of the card
    * @returns street and number string
    */
    GetStreetAndNumber() {
        return this.GetData("address_street_and_number");
    }

    /**
    * Get zip/postal code of the owner of the card
    * @returns zip/postal code string
    */
    GetAddressZip() {
        return this.GetData("address_zip");
    }

    /**
    * Get adress municipality of the owner of the card
    * @returns adress municipality string
    */
    GetAddressMunicipality() {
        return this.GetData("address_municipality");
    }

    /**
    * Get nobility of the owner of the card
    * @returns nobility string
    */
    GetNobility() {
        return this.GetData("nobility");
    }

    /**
    * Get fullname(first + surname) of the owner of the card
    * @returns fullname string
    */
    GetFullName() {
        return `${this.GetFirstName()} ${this.GetSurname()}`;
    }

    /**
    * Generic function to get string data objects from label
    * @param {String} label Value of label attribute of the object
    * @returns string value of the object you requested via the label param
    */
    GetData(label) {
        let value = "";
        try {
            // Get the first slot (cardreader) with a token
            const slotlist = this.pkcs11.C_GetSlotList(true);
            if (slotlist.length > 0) {
                const slot = slotlist[0];
                const session = this.CreateSession(slot);
                if (session != null) {
                    // Search for objects
                    // First, define a search template 
                    const template = [
                        {
                            type: pkcs11js.CKA_CLASS,
                            value: pkcs11js.CKO_DATA,
                        },
                        {
                            type: pkcs11js.CKA_LABEL,
                            value: label,
                        }
                    ];

                    this.pkcs11.C_FindObjectsInit(session, template);
                    const foundObjects = this.pkcs11.C_FindObjects(session, 50);
                    let counter = foundObjects.length;
                    while (counter > 0) {
                        const data = foundObjects[counter - 1];
                        const attrs = this.pkcs11.C_GetAttributeValue(session, data, [
                            { type: pkcs11js.CKA_VALUE }
                        ]);
                        if (attrs[0]) {
                            value = attrs[0].value.toString();
                            break;
                        }
                        counter--;
                    }
                    this.pkcs11.C_FindObjectsFinal(session);
                }
            } else {
                console.log("No card found");
            }
        } catch (err) {
            console.log(err)
        }
        return value;
    }

    /**
     * ( Development use only ) Gets all labels for objects that are available in the slot.
     * Most common are found in the objectNames array.
     */
    _getAllObjectsFromSlot() {
        try {
            const slotlist = this.pkcs11.C_GetSlotList(true);
            if (slotlist.length > 0) {
                const slot = slotlist[0];
                const session = this.CreateSession(slot);
                if (session != null) {
                    this.pkcs11.C_FindObjectsInit(session, [{ type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_DATA }]);
                    let hObject = this.pkcs11.C_FindObjects(session);
                    while (hObject) {
                        const attrs = this.pkcs11.C_GetAttributeValue(session, hObject, [
                            { type: pkcs11js.CKA_CLASS },
                            { type: pkcs11js.CKA_TOKEN },
                            { type: pkcs11js.CKA_LABEL }
                        ]);
                        // Output info for objects from token only
                        if (attrs[1].value[0]) {
                            console.log(`${attrs[2].value.toString()}, 0x${new String(hObject).charCodeAt(0).toString(16)}`);
                        }
                        hObject = this.pkcs11.C_FindObjects(session);
                    }
                    this.pkcs11.C_FindObjectsFinal(session);
                }
            } else {
                console.log("No card detected!")
            }
        } catch (err) {
            console.log(err)
        }
    }

    /**
    * Return ID file contents
    * @returns Buffer of ID file contents
    */
    GetIdFile() {
        return this.GetFile("DATA_FILE");
    }

    /**
    * Return Address file contents
    * @returns Buffer of Address file contents
    */
    GetAddressFile() {
        return this.GetFile("ADDRESS_FILE");
    }

    /**
    * Return Photo file contents
    * @returns Buffer of Photo file contents
    */
    GetPhotoFile() {
        return this.GetFile("PHOTO_FILE");
    }

    /**
    * Return signature Data file contents
    * @returns Buffer of signature Data file contents
    */
    GetIdSignatureFile() {
        return this.GetFile("SIGN_DATA_FILE");
    }

    /**
    * Return signature Address file contents
    * @returns Buffer of signature Address file contents
    */
    GetAddressSignatureFile() {
        return this.GetFile("SIGN_ADDRESS_FILE");
    }

    /**
    * Return RRN Certificate. This certificate is used to validate the file signatures
    * @returns Buffer of RRN Certificate file contents
    */
    GetCertificateRNFile() {
        return this.GetFile("CERT_RN_FILE");
    }

    /**
    * Return raw byte data from objects
    * @param {String} Filename Label value of the object
    * @returns Buffer of the content of the file
    */
    GetFile(Filename) {
        let value = null;
        try {
            // Get the first slot (cardreader) with a token
            const slotlist = this.GetSlotList(true);
            if (slotlist.length > 0) {
                const slot = slotlist[0];
                const session = this.CreateSession(slot);

                // Search for objects
                // First, define a search template 
                const template = [
                    {
                        type: pkcs11js.CKA_CLASS,
                        value: pkcs11js.CKO_DATA,
                    },
                    {
                        type: pkcs11js.CKA_LABEL,
                        value: Filename,
                    }
                ];

                this.pkcs11.C_FindObjectsInit(session, template);
                const foundObjects = this.pkcs11.C_FindObjects(session, 1);
                if (foundObjects.length != 0) {
                    const file = foundObjects[0];
                    const attrs = this.pkcs11.C_GetAttributeValue(session, file, [
                        { type: pkcs11js.CKA_VALUE }
                    ]);
                    if (attrs.length > 0)
                        value = attrs[0].value;
                }
                this.pkcs11.C_FindObjectsFinal(session);
            } else {
                console.log("No card found");
            }
        } catch (err) {
            console.log(err);
        }
        return value;
    }

    /**
    * Return the "authentication" leaf certificate file
    * @returns Buffer of the "authentication" leaf certificate file
    */
    GetCertificateAuthenticationFile() {
        return this.GetCertificateFile("Authentication");
    }
    /**
    * Return the "signature" leaf certificate file
    * @returns Buffer of the "signature" leaf certificate file
    */
    GetCertificateSignatureFile() {
        return this.GetCertificateFile("Signature");
    }
    /**
    * Return the Intermediate CA certificate file
    * @returns Buffer of the Intermediate CA certificate file
    */
    GetCertificateCAFile() {
        return this.GetCertificateFile("CA");
    }
    /**
    * Return the root certificate file
    * @returns Buffer of the root certificate file
    */
    GetCertificateRootFile() {
        return this.GetCertificateFile("Root");
    }

    /**
    * Return raw byte data from objects of object class Certificate
    * @param {String} Certificatename Label value of the certificate object
    * @returns byte array with certificate file
    */
    GetCertificateFile(Certificatename) {
        let value = null;

        try {
            // Get the first slot (cardreader) with a token
            const slotlist = this.GetSlotList(true);
            if (slotlist.length > 0) {
                const slot = slotlist[0];
                const session = this.CreateSession(slot);
                // Search for objects
                // First, define a search template 
                const template = [
                    {
                        type: pkcs11js.CKA_CLASS,
                        value: pkcs11js.CKO_CERTIFICATE,
                    },
                    {
                        type: pkcs11js.CKA_LABEL,
                        value: Certificatename,
                    }
                ];

                this.pkcs11.C_FindObjectsInit(session, template);
                const foundObjects = this.pkcs11.C_FindObjects(session, 1);
                if (foundObjects.length != 0) {
                    const cert = foundObjects[0];
                    const attrs = this.pkcs11.C_GetAttributeValue(session, cert, [
                        { type: pkcs11js.CKA_VALUE },
                    ]);
                    if (attrs) {
                        value = attrs[0].value;
                    }
                }
                this.pkcs11.C_FindObjectsFinal(session);
            } else {
                console.log("No card found");
            }
        } catch (err) {
            console.log(err);
        }
        return value;
    }

    /**
    * Returns a list of PKCS11 labels of the certificate on the card
    * @returns List of labels of certificate objects
    */
    GetCertificateLabels() {
        const labels = [];
        try {
            // Get the first slot (cardreader) with a token
            const slotlist = this.GetSlotList(true);
            if (slotlist.length > 0) {
                const slot = slotlist[0];
                const session = this.CreateSession(slot);
                // Search for objects
                // First, define a search template 

                // "The object class of the objects should be "certificate"" 
                const template = [
                    {
                        type: pkcs11js.CKA_CLASS,
                        value: pkcs11js.CKO_CERTIFICATE,
                    },
                ];

                this.pkcs11.C_FindObjectsInit(session, template);
                const certificates = this.pkcs11.C_FindObjects(session, 100);

                for (const certificate of certificates) {
                    const attrs = this.pkcs11.C_GetAttributeValue(session, certificate, [
                        { type: pkcs11js.CKA_LABEL }
                    ]);
                    labels.push(attrs[0].value.toString());
                }
                this.pkcs11.C_FindObjectsFinal(session);
            } else {
                console.log("No card found");
            }
        } catch (err) {
            console.log(err);
        }
        return labels;
    }

    /**
    * Sign data with a named private key
    * @param {Buffer} data Data to be signed
    * @param {String} privateKeyLabel Label for private key. Can be "Signature" or "Authentication"
    * @returns Signed data
    */
    SignWithCard(data, privateKeyLabel) {
        let encryptedData = null;
        try {
            const slotlist = this.GetSlotList(true);
            if (slotlist.length > 0) {
                const slot = slotlist[0];
                const session = this.CreateSession(slot);

                const template = [
                    {
                        type: pkcs11js.CKA_CLASS,
                        value: pkcs11js.CKO_PRIVATE_KEY,
                    },
                    {
                        type: pkcs11js.CKA_LABEL,
                        value: privateKeyLabel,
                    },
                ];

                this.pkcs11.C_FindObjectsInit(session, template);
                const privatekeys = this.pkcs11.C_FindObjects(session, 1);
                this.pkcs11.C_FindObjectsFinal(session);
                if (privatekeys.length >= 1) {
                    this.pkcs11.C_SignInit(session, { mechanism: pkcs11js.CKM_SHA256_RSA_PKCS }, privatekeys[0]);
                    this.pkcs11.C_SignUpdate(session, data);

                    encryptedData = this.pkcs11.C_SignFinal(session, Buffer.alloc(256));
                }
            } else {
                console.log("No card detected!")
            }
        } catch (err) {
            console.log(err)
        }
        return encryptedData;
    }

    /**
    * Verify a signature with a given certificate. It is assumed that the signature is made from a SHA1 hash of the data.
    * @param {Buffer} data Signed data
    * @param {Buffer} signature Signature to be verified
    * @param {Buffer} publicCertificate Certificate containing the public key used to verify the code
    * @returns True if the verification succeeds
    */
    Verify(data, signature, publicCertificate) {
        try {
            const verify = createVerify("RSA-SHA256");
            verify.update(data);
            verify.end();
            return verify.verify(this._derToPem(publicCertificate), signature);
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }

    /**
     * ( Internal use ) Convert a der format file into a pem format file
     * @param {Buffer} derBuffer 
     */
    _derToPem(derBuffer) {
        const prefix = '-----BEGIN CERTIFICATE-----\n';
        const postfix = '-----END CERTIFICATE-----';
        return prefix + derBuffer.toString('base64').match(/.{0,64}/g).join('\n') + postfix;
    }
}

module.exports = CardReader;