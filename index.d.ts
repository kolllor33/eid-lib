/// <reference types="node"/>

import { SlotInfo, TokenInfo } from "pkcs11js";
type Slot = Buffer;

declare module "eid-lib"{
    export = CardReader;
}

export class CardReader {

    public objectNames: string[];

    constructor(moduleFileName: string);

    /**
     * Initialize the module.
     */
    public Init(): void;

    /**\
     * Call this function at the end of your code. 
     * This will end the conversation with the cardreader and you will need to initialize again.
     */
    public Finalize(): void;

    /**
    * Gets the a List of solts(cardreader) found
    * @param {Boolean} searchCards search cards(true) or only cardreades(false) default is false
    * @returns List of slots
    */
    public GetSlotList(searchCards: boolean): Slot[];

    /**
     * Get the first available slot that has a card in it.
     * @returns A slot
     */
    public GetAvailableSlot(): Slot;

    /**
     * Check if a reader has a card in it
     * @returns boolean
     */
    HasCard(): boolean;

    /**
    * Gets the description of the first slot (cardreader) found
    * @param {Slot} slot a slot
    * @returns Description of the first slot found
    */
    public GetSlotDescription(slot: Slot): SlotInfo;

    /**
    * Tries to create a Session, returns NULL in case of failure
    * @param {Slot} slot a slot
    * @returns A session or null
    */
    public CreateSession(slot: Slot): Buffer | null;

    /**
    * Gets label of token found in the first non-empty slot (cardreader)
    * @param {Slot} slot A slot
    * @returns token info of a slot
    */
    public GetTokenInfo(slot: Slot): TokenInfo;

    /**
    * Get special status of the owner of the card
    * @returns special status string
    */
    public GetSpecialStatus(): string;

    /**
    * Get firstname of the owner of the card
    * @returns firstname string
    */
    public GetFirstName(): string;

    /**
    * Get surname of the owner of the card
    * @returns surname string
    */
    public GetSurname(): string;

    /**
    * Get birth date of the owner of the card
    * @returns birth date string
    */
    public GetDateOfBirth(): string;

    /**
    * Get gender of the owner of the card
    * @returns gender string
    */
    public GetGender(): string;

    /**
    * Get nationality of the owner of the card
    * @returns nationality string
    */
    public GetNationality(): string;

    /**
    * Get national number of the owner of the card
    * @returns national number string
    */
    public GetNationalNumber(): string;

    /**
    * Get location of birth of the owner of the card
    * @returns location of birth string
    */
    public GetLocationOfBirth(): string;

    /**
    * Get street and number of the owner of the card
    * @returns street and number string
    */
    public GetStreetAndNumber(): string;

    /**
    * Get zip/postal code of the owner of the card
    * @returns zip/postal code string
    */
    public GetAddressZip(): string;

    /**
    * Get adress municipality of the owner of the card
    * @returns adress municipality string
    */
    public GetAddressMunicipality(): string;

    /**
    * Get nobility of the owner of the card
    * @returns nobility string
    */
    public GetNobility(): string;

    /**
    * Get fullname(first + surname) of the owner of the card
    * @returns fullname string
    */
    public GetFullName(): string;

    /**
    * Generic function to get string data objects from label
    * @param {String} label Value of label attribute of the object
    * @returns string value of the object you requested via the label param
    */
    public GetData(label: string): string;

    /**
     * ( Development use only ) Gets all labels for objects that are available in the slot.
     * Most common are found in the objectNames array.
     */
    private _getAllObjectsFromSlot(): void;

    /**
    * Return ID file contents
    * @returns Buffer of ID file contents
    */
    public GetIdFile(): Buffer;

    /**
    * Return Address file contents
    * @returns Buffer of Address file contents
    */
    public GetAddressFile(): Buffer;

    /**
    * Return Photo file contents
    * @returns Buffer of Photo file contents
    */
    public GetPhotoFile(): Buffer;

    /**
    * Return signature Data file contents
    * @returns Buffer of signature Data file contents
    */
    public GetIdSignatureFile(): Buffer;

    /**
    * Return signature Address file contents
    * @returns Buffer of signature Address file contents
    */
    public GetAddressSignatureFile(): Buffer;

    /**
    * Return RRN Certificate. This certificate is used to validate the file signatures
    * @returns Buffer of RRN Certificate file contents
    */
    public GetCertificateRNFile(): Buffer;

    /**
    * Return raw byte data from objects
    * @param {String} Filename Label value of the object
    * @returns Buffer of the content of the file
    */
    public GetFile(Filename: string): Buffer;

    /**
    * Return the "authentication" leaf certificate file
    * @returns Buffer of the "authentication" leaf certificate file
    */
    public GetCertificateAuthenticationFile(): Buffer;

    /**
    * Return the "signature" leaf certificate file
    * @returns Buffer of the "signature" leaf certificate file
    */
    public GetCertificateSignatureFile(): Buffer;

    /**
    * Return the Intermediate CA certificate file
    * @returns Buffer of the Intermediate CA certificate file
    */
    public GetCertificateCAFile(): Buffer;

    /**
    * Return the root certificate file
    * @returns Buffer of the root certificate file
    */
    public GetCertificateRootFile(): Buffer;

    /**
    * Return raw byte data from objects of object class Certificate
    * @param {String} Certificatename Label value of the certificate object
    * @returns byte array with certificate file
    */
    public GetCertificateFile(Certificatename: string): Buffer;

    /**
    * Returns a list of PKCS11 labels of the certificate on the card
    * @returns List of labels of certificate objects
    */
    public GetCertificateLabels(): string[];

    /**
    * Sign data with a named private key
    * @param {Buffer} data Data to be signed
    * @param {String} privateKeyLabel Label for private key. Can be "Signature" or "Authentication"
    * @returns Signed data
    */
    public SignWithCard(data: Buffer, privateKeyLabel: string): Buffer;

    /**
    * Verify a signature with a given certificate. It is assumed that the signature is made from a SHA1 hash of the data.
    * @param {Buffer} data Signed data
    * @param {Buffer} signature Signature to be verified
    * @param {Buffer} certificate Certificate containing the public key used to verify the code
    * @returns True if the verification succeeds
    */
    public Verify(data: Buffer, signature: Buffer, publicCertificate: Buffer): boolean;

    /**
     * Encrypted data wite your card
     * @param {Buffer} data Data that needs to be encrypted
     * @returns Encrypted data
     */
    EncrypteData(data: Buffer): string;

    /**
     * Decrypt data wite your card
     * @param {string} cipherData Data that has been encrypted
     * @returns Decrypted data
     */
    DecrypteData(cipherData: string): Buffer;

    /**
     * Convert a der format file into a pem format file
     * @param {Buffer} derBuffer 
     */
    public _derToPem(derBuffer: Buffer): string;
}