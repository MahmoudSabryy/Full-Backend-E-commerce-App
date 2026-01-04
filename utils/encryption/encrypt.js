import CryptoJS from "crypto-js";
export const encrypt = ({
  plainText,
  Encryption_Secret_Key = process.env.ENCRYPTION_SECRET_KEY,
}) => {
  return CryptoJS.AES.encrypt(plainText, Encryption_Secret_Key).toString();
};
export const decrypt = ({
  Encrypted_Text,
  Encryption_Secret_Key = process.env.ENCRYPTION_SECRET_KEY,
}) => {
  return CryptoJS.AES.decrypt(Encrypted_Text, Encryption_Secret_Key).toString(
    CryptoJS.enc.Utf8
  );
};
